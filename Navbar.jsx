import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";

const Navbar = ({
  adminAccount,
  connectAdminMetaMask,
  searchTerm,
  handleSearch,
  setDrawerOpen,
}) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Admin Dashboard
        </Typography>
        {adminAccount ? (
          <Chip
            label={`Connected: ${adminAccount.slice(
              0,
              6
            )}...${adminAccount.slice(-4)}`}
            color="secondary"
            sx={{ marginRight: 2 }}
          />
        ) : (
          <Button color="inherit" onClick={connectAdminMetaMask}>
            Connect MetaMask
          </Button>
        )}
        <TextField
          variant="outlined"
          placeholder="Search..."
          size="small"
          onChange={handleSearch}
          value={searchTerm}
          sx={{ marginLeft: 2, width: "200px" }}
          InputProps={{
            endAdornment: (
              <IconButton>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
