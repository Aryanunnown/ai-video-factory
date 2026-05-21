import { ReactNode } from "react";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => (
  <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" component="div">
          AI Video Factory
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/video/create">
            Create Video
          </Button>
          <Button color="inherit" component={RouterLink} to="/video/list">
            Video List
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
    <Container sx={{ py: 4 }}>{children}</Container>
  </Box>
);

export default AppLayout;
