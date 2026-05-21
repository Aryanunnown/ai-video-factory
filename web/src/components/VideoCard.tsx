import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { VideoResponse } from "../types/video";

interface VideoCardProps {
  video: VideoResponse;
}

const VideoCard = ({ video }: VideoCardProps) => (
  <Card>
    <CardActionArea component={RouterLink} to={`/video/${video.id}`}>
      <CardContent>
        <Typography variant="h6">{video.topic}</Typography>
        <Typography color="text.secondary">Status: {video.status}</Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

export default VideoCard;
