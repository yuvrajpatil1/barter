import { Star } from "lucide-react";
import React, { FC } from "react";

type Props = {
  rating: number;
  ratingCount: number;
};

const Ratings: FC<Props> = ({ rating, ratingCount }) => {
  const stars = [];

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 1; i <= fullStars; i++) {
    stars.push(
      <Star
        key={`star-full-${i}`}
        className="fill-yellow-500 stroke-yellow-500"
      />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <div key="star-half" className="relative w-5 h-5">
        <Star className="fill-yellow-500 stroke-yellow-500 absolute left-0 top-0 w-5 h-5 clip-half" />
        <Star className="stroke-gray-400 absolute left-0 top-0 w-5 h-5" />
      </div>
    );
  }

  for (let i = 1; i <= emptyStars; i++) {
    stars.push(<Star key={`star-empty-${i}`} className="stroke-gray-400" />);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">{stars}</div>
      <span className="text-sm text-gray-500">({ratingCount})</span>
    </div>
  );
};
export default Ratings;
