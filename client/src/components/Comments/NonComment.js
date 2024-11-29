import React, { useState, useEffect } from 'react';
import axios from '../Forms/axiosconfig';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CommentSection = ({ routeName }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false
  };

  useEffect(() => {
    if (routeName) {
      fetchComments();
    }
  }, [routeName]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`/api/comments/${encodeURIComponent(routeName)}`);
      
      if (response.data.success) {
        setComments(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading comments...</div>;
  }

  const recentComments = comments.slice(0, 3);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {comments.length > 0 ? (
          <div>
            <Slider {...sliderSettings} className="mb-4">
              {recentComments.map((comment) => (
                <div key={comment._id} className="px-2">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="font-medium text-blue-600">{comment.username}</div>
                    <div className="text-gray-600 text-sm">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </div>
                    <div className="mt-2">{comment.content}</div>
                  </div>
                </div>
              ))}
            </Slider>

            {comments.length > 3 && (
              <div className="text-center mt-4">
                <Link 
                  to={`/comments/${encodeURIComponent(routeName)}`}
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  See all {comments.length} comments
                </Link>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">No comments available.</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;