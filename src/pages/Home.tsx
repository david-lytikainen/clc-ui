import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getBannerPictures, getFooterPictures, type BannerPictureItem, type FooterPictureItem } from '../services/api';
import useProducts from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import SignInModal from '../components/SignInModal';

const BANNER_HEIGHT = 500;
const PRODUCTS_PER_PAGE = 4;
const TWO_IMAGE_HEIGHT = 500;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [pictures, setPictures] = useState<BannerPictureItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { products } = useProducts();
  const [pageIndex, setPageIndex] = useState(0);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [footerPictures, setFooterPictures] = useState<FooterPictureItem[]>([]);

  useEffect(() => {
    getBannerPictures()
      .then(setPictures)
      .catch(() => setPictures([]));
  }, []);

  useEffect(() => {
    getFooterPictures()
      .then(setFooterPictures)
      .catch(() => setFooterPictures([]));
  }, []);

  const hasPictures = pictures.length > 0;
  const currentPicture = hasPictures ? pictures[currentIndex] : null;

  const footerLeft = footerPictures.find((p) => p.footer_index === 0);
  const footerRight = footerPictures.find((p) => p.footer_index === 1);

  const maxPage = Math.max(0, Math.ceil(products.length / PRODUCTS_PER_PAGE) - 1);
  const atStart = pageIndex <= 0;
  const atEnd = pageIndex >= maxPage;

  const handlePrev = () => {
    if (!atStart) setPageIndex((p) => p - 1);
  };

  const handleNext = () => {
    if (!atEnd) setPageIndex((p) => p + 1);
  };

  return (
    <Box sx={{ backgroundColor: 'background.paper' }}>
      {/* Banner */}
      <Box
        sx={{
          width: '100%',
          height: BANNER_HEIGHT,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        {currentPicture?.image_url ? (
          <Box
            component="img"
            src={currentPicture.image_url}
            alt=""
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : null}

        {hasPictures && pictures.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            {pictures.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setCurrentIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: currentIndex === idx ? 'primary.main' : '#fff',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: currentIndex === idx ? 'primary.dark' : 'primary.main',
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Perfect Gifts – one row, 4 visible, slide with arrows */}
      <Box sx={{ py: 4, px: { xs: 1, sm: 2 } }}>
        <Typography variant="h4" sx={{ textAlign: 'center', mb: 3 }}>
          Perfect Gifts from Cinnamon Leather Co
        </Typography>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'stretch',
            overflow: 'hidden',
          }}
        >
          <IconButton
            onClick={handlePrev}
            disabled={atStart}
            aria-label="Previous products"
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Box
            sx={{
              flex: 1,
              overflow: 'hidden',
              mx: 6,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'nowrap',
                width: `${products.length * 25}%`,
                transform: products.length > 0
                  ? `translateX(-${pageIndex * (PRODUCTS_PER_PAGE / products.length) * 100}%)`
                  : 'none',
                transition: 'transform 0.35s ease-out',
              }}
            >
              {products.map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    flex: `0 0 ${products.length > 0 ? 100 / products.length : 25}%`,
                    width: `${products.length > 0 ? 100 / products.length : 25}%`,
                    boxSizing: 'border-box',
                    px: 0.5,
                  }}
                >
                  <ProductCard product={p} onClick={() => navigate(`/product/${p.id}`)} />
                </Box>
              ))}
            </Box>
          </Box>

          <IconButton
            onClick={handleNext}
            disabled={atEnd}
            aria-label="Next products"
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Two side-by-side images (footer pictures) with centered buttons */}
      <Box sx={{ display: 'flex', flexWrap: 'nowrap', width: '100%' }}>
        <Box
          sx={{
            width: '50%',
            height: TWO_IMAGE_HEIGHT,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            overflow: 'hidden',
          }}
        >
          {footerLeft?.image_url && (
            <Box
              component="img"
              src={footerLeft.image_url}
              alt=""
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
              }}
            />
          )}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/shop')}
            sx={{ textTransform: 'none', position: 'relative', zIndex: 1 }}
          >
            Shop All
          </Button>
        </Box>
        <Box
          sx={{
            width: '50%',
            height: TWO_IMAGE_HEIGHT,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            overflow: 'hidden',
          }}
        >
          {footerRight?.image_url && (
            <Box
              component="img"
              src={footerRight.image_url}
              alt=""
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
              }}
            />
          )}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => (isAuthenticated ? navigate('/profile') : setSignInModalOpen(true))}
            sx={{ textTransform: 'none', position: 'relative', zIndex: 1 }}
          >
            {isAuthenticated ? 'My Profile' : 'Sign in'}
          </Button>
        </Box>
      </Box>

      <SignInModal
        open={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
      />
    </Box>
  );
};

export default Home;
