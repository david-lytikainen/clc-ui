import React from 'react';
import { Box, Divider, Typography } from '@mui/material';

const PolicySectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Divider
      sx={{
        mt: 3,
        mb: 1.25,
        borderColor: 'text.secondary',
        opacity: 0.35,
      }}
    />
    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, textAlign: 'left', mb: 1 }}>
      {children}
    </Typography>
  </>
);

const listItemSx = {
  textAlign: 'left' as const,
  mb: 1.5,
  lineHeight: 1.7,
  '&:last-child': { mb: 0 },
};

const PrivacyPolicy: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: 'background.paper', minHeight: '60vh' }}>
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          maxWidth: { xs: '100%', md: '50%' },
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 0 },
          py: { xs: 3, md: 5 },
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{ textAlign: 'center', mb: 3, fontWeight: 600 }}
        >
          Privacy Policy
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          This Privacy Policy describes how Cinnamon Leather Company (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;) collects, uses, and shares your personal information when you visit or make a purchase
          from our website.
        </Typography>

        <PolicySectionTitle>Personal Information We Collect</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          When you place an order or create a profile on our site, we may collect the following information:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
          {['Name', 'Email address', 'Shipping and billing address', 'Phone number (optional, if you choose to provide it)'].map(
            (text) => (
              <Typography key={text} component="li" variant="body1" sx={listItemSx}>
                {text}
              </Typography>
            ),
          )}
        </Box>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          Payment information is processed securely through our third-party payment provider, Stripe. We do not
          store full payment details on our servers.
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          We may also automatically receive limited technical information, such as your IP address, when you
          access our website.
        </Typography>

        <PolicySectionTitle>How We Use Your Information</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          We use the information we collect to:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
          {[
            'Process and fulfill your orders',
            'Communicate with you regarding purchases, updates, or customer service inquiries',
            'Maintain your account/profile (if you choose to create one)',
            'Help detect and prevent fraudulent transactions',
          ].map((text) => (
            <Typography key={text} component="li" variant="body1" sx={listItemSx}>
              {text}
            </Typography>
          ))}
        </Box>

        <PolicySectionTitle>Sharing Your Information</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          We share your personal information only as necessary to operate our business, including:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
          {['Stripe, to securely process payments', 'Shipping providers, to deliver your orders'].map((text) => (
            <Typography key={text} component="li" variant="body1" sx={listItemSx}>
              {text}
            </Typography>
          ))}
        </Box>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          We do not sell, rent, or trade your personal information.
        </Typography>

        <PolicySectionTitle>Data Retention</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          We retain your information only for as long as necessary to provide our services, fulfill orders, and
          comply with legal or accounting obligations.
        </Typography>

        <PolicySectionTitle>Your Rights</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          Depending on your location, you may have the right to access, correct, or request deletion of your
          personal information. To make a request, please contact us at cinnamonleatherco@gmail.com.
        </Typography>

        <PolicySectionTitle>Security</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          We take reasonable measures to protect your personal information. However, no method of transmission over
          the internet is completely secure, and we cannot guarantee absolute security.
        </Typography>

        <PolicySectionTitle>Changes to This Policy</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          We may update this Privacy Policy from time to time to reflect changes in our practices or for legal
          reasons. Any updates will be posted on this page.
        </Typography>

        <PolicySectionTitle>Contact Us</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', lineHeight: 1.7 }}>
          If you have any questions about this Privacy Policy or how your information is handled, please contact
          us at: cinnamonleatherco@gmail.com.
        </Typography>
      </Box>
    </Box>
  );
};

export default PrivacyPolicy;
