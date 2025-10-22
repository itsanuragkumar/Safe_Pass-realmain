import React, { useState } from "react";
import Sidebar1 from "../../components/Sidebar1";
import Navbar from "../../components/Navbar";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";

const RegistrationRequests = ({ adminAccount, connectAdminMetaMask }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar1 />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Navbar */}
        <Navbar
          adminAccount={adminAccount}
          connectAdminMetaMask={connectAdminMetaMask}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <Drawer
            variant="persistent"
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          >
            <List>
              <ListItem button={true}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button={true}>
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Registration Requests" />
              </ListItem>
              <ListItem button={true}>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary="Search" />
              </ListItem>
            </List>
          </Drawer>
        </main>
      </div>
    </div>
  );
};

export default RegistrationRequests;
