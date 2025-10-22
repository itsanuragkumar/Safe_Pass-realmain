import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import RedditIcon from "@mui/icons-material/Reddit";
import GitHubIcon from "@mui/icons-material/GitHub";
import TelegramIcon from "@mui/icons-material/Telegram";

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: "#0F0F0F",
  color: "#FFFFFF",
  padding: theme.spacing(4, 0),
}));

const FooterContent = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

const SocialIcons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: "#808080",
  textDecoration: "none",
  "&:hover": {
    color: "#FFFFFF",
  },
}));

const Footer = () => {
  return (
    <FooterWrapper>
      <FooterContent maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Managed by
            </Typography>
            <Typography
              variant="h5"
              gutterBottom
              style={{ fontWeight: "bold" }}
            >
              SAFE PASS TEAM
            </Typography>
            <SocialIcons>
              <IconButton
                color="inherit"
                aria-label="YouTube"
                component={Link}
                href="#"
                target="_blank"
              >
                <YouTubeIcon />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Twitter"
                component={Link}
                href="#"
                target="_blank"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Discord"
                component={Link}
                href="#"
                target="_blank"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Reddit"
                component={Link}
                href="#"
                target="_blank"
              >
                <RedditIcon />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="GitHub"
                component={Link}
                href="#"
                target="_blank"
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Telegram"
                component={Link}
                href="#"
                target="_blank"
              >
                <TelegramIcon />
              </IconButton>
            </SocialIcons>
            <Typography
              variant="body2"
              style={{ marginTop: "16px", color: "#808080" }}
            >
              © 2024 Foundation. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom></Typography>
            <Box display="flex" flexDirection="column">
              <FooterLink href="#">Grants</FooterLink>
              <FooterLink href="#">Break </FooterLink>
              <FooterLink href="#">Media Kit</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Disclaimer</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              GET CONNECTED
            </Typography>
            <Box display="flex" flexDirection="column">
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Newsletter</FooterLink>
            </Box>
          </Grid>
        </Grid>
      </FooterContent>
    </FooterWrapper>
  );
};

export default Footer;
