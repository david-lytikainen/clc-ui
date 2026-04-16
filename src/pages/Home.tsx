import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button, ButtonBase, useMediaQuery } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getBannerPictures, getFooterPictures, type BannerPictureItem, type FooterPictureItem } from '../services/api';
import useProducts from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import SignInModal from '../components/SignInModal';
import { theme } from '../styles/theme';
import { colors } from '../styles/colors';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [pictures, setPictures] = useState<BannerPictureItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { products: collectionProducts } = useProducts();
  const [pageIndex, setPageIndex] = useState(0);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [footerPictures, setFooterPictures] = useState<FooterPictureItem[]>([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const BANNER_HEIGHT = isMobile ? 300 : 670;
  const productsPerPage = isMobile ? 1 : 4;
  const TWO_IMAGE_HEIGHT = isMobile ? 300 : 500;

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

  const maxPage = Math.max(0, Math.ceil(collectionProducts.length / productsPerPage) - 1);

  useEffect(() => {
    setPageIndex((p) => Math.min(p, maxPage));
  }, [maxPage]);

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
          width: isMobile ? '100%' : '80%',
          height: BANNER_HEIGHT,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.default',
          mx: 'auto',
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

      {/* Shop the Collection – 1 visible on mobile, 4 on md+, slide with arrows */}
      <Box sx={{ py: 4, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ButtonBase
            onClick={() => navigate('/shop')}
            aria-label="Shop the collection"
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '9999px',
              bgcolor: 'transparent',
              color: 'inherit',
              transition: 'background-color 120ms ease, color 120ms ease',
              '&:hover': {
                bgcolor: colors.primary.main,
                color: '#fff',
              },
              '&:active': {
                bgcolor: colors.primary.main,
                color: '#fff',
              },
              '&:focus-visible': {
                outline: `2px solid ${colors.primary.main}`,
                outlineOffset: 3,
              },
            }}
          >
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 0, pb: 0 }}>
              Shop the Collection
            </Typography>
          </ButtonBase>
        </Box>
        <Typography sx={{ textAlign: 'center', pt: 0, mb: 2, fontFamily: 'Brush Script MT', fontWeight: '50', opacity: '70%', fontSize: '1.6em' }}>
          timeless pieces for everyday life
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
              mx: { xs: 1, sm: 6 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'nowrap',
                width:
                  collectionProducts.length > 0
                    ? `${collectionProducts.length * (100 / productsPerPage)}%`
                    : `${100 / productsPerPage}%`,
                transform: collectionProducts.length > 0
                  ? `translateX(-${pageIndex * (productsPerPage / collectionProducts.length) * 100}%)`
                  : 'none',
                transition: 'transform 0.35s ease-out',
              }}
            >
              {collectionProducts.map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    flex: `0 0 ${collectionProducts.length > 0 ? 100 / collectionProducts.length : 100 / productsPerPage}%`,
                    width: `${collectionProducts.length > 0 ? 100 / collectionProducts.length : 100 / productsPerPage}%`,
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
      <Box sx={{ display: 'flex', flexWrap: 'nowrap', width: '100%', mt: isMobile ? 2 : 8 }}>
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
            size="large"
            onClick={() => navigate('/your-favorites')}
            sx={{
              textTransform: 'none',
              position: 'relative',
              zIndex: 1,
              bgcolor: 'secondary.main',
              color: 'primary.main',
              boxShadow: 2,
              '&:hover': { bgcolor: '#f5f5f5', color: 'primary.dark' },
            }}
          >
            Your Favorites
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
            size="large"
            onClick={() => navigate('/our-favorites')}
            sx={{
              textTransform: 'none',
              position: 'relative',
              zIndex: 1,
              bgcolor: 'secondary.main',
              color: 'primary.main',
              boxShadow: 2,
              '&:hover': { bgcolor: '#f5f5f5', color: 'primary.dark' },
            }}
          >
            Our Favorites
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
