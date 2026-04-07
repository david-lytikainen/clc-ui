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

const TermsOfService: React.FC = () => {
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
        <Typography variant="h6" component="h2" sx={{ textAlign: 'center', mb: 3, fontWeight: 600 }}>
          Terms of Service
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          Welcome to Cinnamon Leather Company (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By
          accessing or using our website, purchasing our products, or creating an account, you agree to be bound
          by these Terms of Service. Please read them carefully.
        </Typography>

        <PolicySectionTitle>Use of Our Website</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          You agree to use this website only for lawful purposes and in accordance with all applicable laws and
          regulations, including those of the State of Maryland. We reserve the right to refuse service to anyone
          for any reason at any time.
        </Typography>

        <PolicySectionTitle>Products</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          All products are handmade and may feature slight variations in color, grain, and finish. These natural
          differences are not considered defects. We make every effort to display products accurately; however,
          we cannot guarantee that your device will display colors precisely.
        </Typography>

        <PolicySectionTitle>Pricing and Availability</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          All prices are listed in U.S. dollars and are subject to change at any time without notice. We reserve
          the right to modify or discontinue products at any time without liability. In the event of a pricing
          error, we reserve the right to cancel or refuse any orders placed for products listed at an incorrect
          price.
        </Typography>

        <PolicySectionTitle>Orders and Payment</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          By placing an order, you confirm that all information provided is accurate and complete. Payments are
          processed securely through Stripe. We reserve the right to refuse, cancel, or limit any order for any
          reason, including suspected fraud or unauthorized activity.
        </Typography>

        <PolicySectionTitle>Accounts</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          If you create an account, you are responsible for maintaining the confidentiality of your login
          information and for all activities under your account. You agree to notify us immediately of any
          unauthorized use. We are not liable for losses resulting from unauthorized access due to your failure to
          safeguard your credentials.
        </Typography>

        <PolicySectionTitle>Returns and Refunds</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          All returns and refunds are governed by our Refund Policy. By making a purchase, you acknowledge and
          agree to those terms, including any applicable restocking fees and eligibility requirements.
        </Typography>

        <PolicySectionTitle>Shipping and Risk of Loss</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          All items are shipped via third-party carriers. Risk of loss and title for products pass to you upon
          delivery to the carrier. We are not responsible for delays, lost packages, or damage caused by shipping
          carriers.
        </Typography>

        <PolicySectionTitle>Intellectual Property</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          All content on this website—including but not limited to images, product designs, text, logos, and
          branding—is the exclusive property of Cinnamon Leather Company and is protected under applicable
          intellectual property laws. Unauthorized use, reproduction, or distribution is strictly prohibited.
        </Typography>

        <PolicySectionTitle>User Conduct</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          You agree not to:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
          {[
            'Use the website for any fraudulent or unlawful purpose',
            'Interfere with or disrupt the operation of the website',
            'Attempt to gain unauthorized access to any portion of the site or its systems',
          ].map((text) => (
            <Typography key={text} component="li" variant="body1" sx={listItemSx}>
              {text}
            </Typography>
          ))}
        </Box>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          We reserve the right to terminate or restrict access for violations of these terms.
        </Typography>

        <PolicySectionTitle>Disclaimer of Warranties</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          All products and services are provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without any
          warranties of any kind, either express or implied, to the fullest extent permitted under Maryland law,
          including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
        </Typography>

        <PolicySectionTitle>Limitation of Liability</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          To the fullest extent permitted by Maryland law, Cinnamon Leather Company shall not be liable for any
          indirect, incidental, punitive, or consequential damages arising from your use of our website or products.
          Our total liability for any claim shall not exceed the amount paid for the product in question.
        </Typography>

        <PolicySectionTitle>Indemnification</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          You agree to indemnify, defend, and hold harmless Cinnamon Leather Company and its owners, employees, and
          affiliates from any claims, damages, liabilities, or expenses arising out of your use of the website,
          violation of these Terms, or misuse of our products.
        </Typography>

        <PolicySectionTitle>Dispute Resolution</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          Any dispute arising out of or relating to these Terms or your use of the website shall first be
          attempted to be resolved through good-faith negotiation. If unresolved, such disputes shall be resolved
          through binding arbitration in the State of Maryland, in accordance with applicable arbitration rules. You
          agree to waive any right to participate in class actions or class-wide arbitration, to the extent
          permitted by law.
        </Typography>

        <PolicySectionTitle>Governing Law</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          These Terms of Service and any disputes arising hereunder shall be governed by and construed in
          accordance with the laws of the State of Maryland, without regard to its conflict of law principles.
        </Typography>

        <PolicySectionTitle>Severability</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          If any provision of these Terms is found to be unlawful, void, or unenforceable under Maryland law, that
          provision shall be deemed severable and shall not affect the validity of the remaining provisions.
        </Typography>

        <PolicySectionTitle>Changes to These Terms</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          We reserve the right to update or modify these Terms at any time. Changes will be effective immediately
          upon posting. Continued use of the website constitutes acceptance of the revised Terms.
        </Typography>

        <PolicySectionTitle>Contact Us</PolicySectionTitle>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 1, lineHeight: 1.7 }}>
          If you have any questions about these Terms of Service, please contact us at:
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'left', lineHeight: 1.7 }}>
          cinnamonleatherco@gmail.com
        </Typography>
      </Box>
    </Box>
  );
};

export default TermsOfService;
