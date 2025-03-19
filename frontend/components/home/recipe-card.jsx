import React from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Clock, ChefHat } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
    likes,
    comments,
    user,
    createdAt,
  } = recipe;

  // Format date
  const formattedDate = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : '';

  // Default image if none provided
  const displayImage = image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/recipes/${_id}`} className="cursor-pointer">
        <div className="relative aspect-video w-full overflow-hidden">
          <img
            src={displayImage}
            alt={title}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
          <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-gray-700">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/recipes/${_id}`}>
          <h3 className="line-clamp-1 text-lg font-semibold hover:text-amber-500 transition-colors">
            {title}
          </h3>
        </Link>
        
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4 text-gray-400" />
              <span>{cookingTime} min</span>
            </div>
            
            <div className="flex items-center">
              <MessageCircle className="mr-1 h-4 w-4 text-gray-400" />
              <span>{comments?.length || 0}</span>
            </div>
          </div>

          <div className="flex items-center">
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (onLike) onLike(_id);
              }}
              className="flex items-center gap-1 rounded-full hover:text-amber-500 transition-colors"
            >
              <Heart className={`h-4 w-4 ${likes?.some(like => like.user === user?._id) ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
              <span>{likes?.length || 0}</span>
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-gray-500">
          <Link href={user?._id ? `/recipes/user/${user._id}` : '#'} className="flex items-center hover:text-amber-500 transition-colors">
            <ChefHat className="mr-1 h-4 w-4" />
            <span>{user?.name || 'Unknown Chef'}</span>
          </Link>
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
} 