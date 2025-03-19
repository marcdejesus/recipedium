import React from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Clock } from 'lucide-react';
import { formatDate, truncate } from '@/lib/utils';

/**
 * Recipe card component for displaying recipe previews
 * 
 * @param {Object} props - Component props
 * @param {Object} props.recipe - Recipe data
 * @param {Function} props.onLike - Function to handle liking a recipe
 * @returns {JSX.Element} Recipe card component
 */
export default function RecipeCard({ recipe, onLike }) {
  if (!recipe) return null;

  const {
    _id,
    title,
    description,
    cookingTime,
    category,
    diet,
    difficulty,
    image,
    likesCount,
    commentsCount,
    user,
    createdAt,
  } = recipe;

  // Default image if none provided
  const displayImage = image || '/images/default-recipe.jpg';

  return (
    <div className="overflow-hidden transition-all hover:shadow-md bg-white rounded-lg shadow-sm">
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={displayImage}
          alt={title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold">
          {category}
        </div>
      </div>

      <div className="p-4 pb-0">
        <h3 className="line-clamp-1 text-xl font-semibold">{title}</h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
          <span>by {user?.name || 'Anonymous'}</span>
          <span>•</span>
          <span>{createdAt ? new Date(createdAt).toLocaleDateString() : 'Recently'}</span>
        </div>
      </div>

      <div className="p-4 pb-0">
        <p className="line-clamp-2 text-sm text-gray-600">
          {description ? (description.length > 120 ? description.substring(0, 120) + '...' : description) : 'No description available'}
        </p>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {diet && diet.length > 0 && diet.map((item) => (
            <span 
              key={item} 
              className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
            >
              {item}
            </span>
          ))}
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
            {difficulty}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
            <Clock className="h-3 w-3" />
            {cookingTime} min
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onLike && onLike(_id)} 
            className="flex items-center gap-1 p-0 text-sm hover:bg-transparent"
          >
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-xs">{likesCount || 0}</span>
          </button>
          
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-blue-500" />
            <span className="text-xs">{commentsCount || 0}</span>
          </div>
        </div>
        
        <Link href={`/recipes/${_id}`} passHref>
          <button className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800">
            View Recipe
          </button>
        </Link>
      </div>
    </div>
  );
} 