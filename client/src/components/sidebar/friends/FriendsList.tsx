import SearchIcon from '@mui/icons-material/Search';
import { FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Grid } from '@mui/system';

import Friend from './Friend';

const FriendsList = () => {
  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <FormControl fullWidth size="small" margin="normal">
          <InputLabel>Search</InputLabel>
          <OutlinedInput
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            label="Search"
          />
        </FormControl>
      </Grid>
      <Grid size={12}>
        <Friend />
      </Grid>
      <Grid size={12}>
        <Friend />
      </Grid>
      <Grid size={12}>
        <Friend />
      </Grid>
    </Grid>
  );
};

export default FriendsList;
