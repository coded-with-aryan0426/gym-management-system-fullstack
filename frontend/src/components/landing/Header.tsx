
import { AppBar, Toolbar, Button, Box } from '@mui/material';

export default function Header() {
  return (
    <AppBar position="fixed" elevation={0} sx={{ backgroundColor: 'black' }}>
      <Toolbar>
        <Typography variant="h6">GymFlow</Typography>
      </Toolbar>
    </AppBar>
  );
}
import { Typography } from '@mui/material';
