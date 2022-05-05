import Rating from "@mui/material/Rating";
import Paper from "@mui/material/Paper";
import { Card, CardContent, CardMedia, Typography, Chip } from "@mui/material";
import { useState } from "react";

export function BookCard({ bookData }) {
  const ratingMap = {
    One: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
  };

  return (
    <Paper>
      <div className="bookCard">
        <div className="imageWrapper">
          <img
            src={bookData.image}
            className="bookImage"
            alt={bookData.title}
          />
        </div>
        <div className="cardContent">
          <div className="cardContentTop">
            <Typography variant="overline">{bookData.price}</Typography>
            <Rating
              name="read-only"
              value={ratingMap[bookData.rating]}
              precision={1}
              readOnly
              size="small"
            />
            <Chip label={bookData.category} size="small" />
          </div>
          <Typography variant="h6">{bookData.title}</Typography>
          <Typography variant="overline">UPC: {bookData.upc}</Typography>
        </div>
      </div>
    </Paper>
  );
}
