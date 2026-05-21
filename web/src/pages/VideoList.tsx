import { Card, CardContent, List, ListItem, ListItemText, Typography } from "@mui/material";

const VideoList = () => (
  <Card>
    <CardContent>
      <Typography variant="h5" gutterBottom>
        Video Jobs
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Video list will display created jobs here." />
        </ListItem>
      </List>
    </CardContent>
  </Card>
);

export default VideoList;
