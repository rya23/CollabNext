"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Filter, 
  Calendar, 
  User, 
  Plus, 
  ThumbsUp,
  MoreHorizontal,
  MessageCircle
} from 'lucide-react';

// Types
interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  createdAt: string;
  likes: number;
  comments: Comment[];
  tags: string[];
  liked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  liked?: boolean;
}

const CommunityForum = () => {
  // State for forum posts
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: '1',
      title: 'Tips for creating compelling comic narratives?',
      content: 'I\'ve been working on a sci-fi comic series and I\'m struggling with pacing. What techniques do you use to ensure your story flows well across multiple panels?',
      author: {
        name: 'Alex Morgan',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        role: 'Comic Artist'
      },
      createdAt: '2025-04-10T14:48:00',
      likes: 24,
      comments: [
        {
          id: 'c1',
          content: 'I find that sketching a rough storyboard before committing to final panels helps tremendously with pacing issues.',
          author: {
            name: 'Jamie Lee',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          },
          createdAt: '2025-04-10T15:30:00',
          likes: 7
        },
        {
          id: 'c2',
          content: 'Have you tried the 3-act structure? It works well even for comic panels. Break your story into setup, confrontation, and resolution.',
          author: {
            name: 'Marcus Chen',
            avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
          },
          createdAt: '2025-04-11T09:15:00',
          likes: 12
        }
      ],
      tags: ['storytelling', 'comics', 'narrative']
    },
    {
      id: '2',
      title: 'AI tools for character consistency across panels?',
      content: 'I\'m looking for AI tools that can help maintain character consistency across multiple comic panels. Anyone have recommendations for good tools that integrate with standard illustration software?',
      author: {
        name: 'Sophia Williams',
        avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
        role: 'Digital Artist'
      },
      createdAt: '2025-04-09T10:22:00',
      likes: 18,
      comments: [
        {
          id: 'c3',
          content: 'Have you tried Nuclitron\'s character reference tool? It\'s been a game-changer for my workflow.',
          author: {
            name: 'Devon Taylor',
            avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
          },
          createdAt: '2025-04-09T11:05:00',
          likes: 5
        }
      ],
      tags: ['AI', 'character design', 'tools']
    },
    {
      id: '3',
      title: 'Looking for feedback on my first noir-style comic panel',
      content: 'Just finished my first attempt at a noir-style comic panel. Would love some constructive feedback from the community! Here\'s a link to the image: [image link]',
      author: {
        name: 'Riley Jordan',
        avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
        role: 'Beginner Artist'
      },
      createdAt: '2025-04-08T16:30:00',
      likes: 31,
      comments: [
        {
          id: 'c4',
          content: 'The lighting is perfect for noir! Maybe add a bit more contrast in the shadowy areas to really sell the mood.',
          author: {
            name: 'Chris Hernandez',
            avatar: 'https://randomuser.me/api/portraits/men/37.jpg',
          },
          createdAt: '2025-04-08T17:12:00',
          likes: 8
        },
        {
          id: 'c5',
          content: 'I love the composition! The character positioning really tells a story even in a single panel.',
          author: {
            name: 'Taylor Kim',
            avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
          },
          createdAt: '2025-04-08T18:45:00',
          likes: 10
        }
      ],
      tags: ['noir', 'feedback', 'new artist']
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('latest');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  // Handle like post
  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.liked || false;
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          liked: !isLiked
        };
      }
      return post;
    }));
  };

  // Handle like comment
  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments.map(comment => {
          if (comment.id === commentId) {
            const isLiked = comment.liked || false;
            return {
              ...comment,
              likes: isLiked ? comment.likes - 1 : comment.likes + 1,
              liked: !isLiked
            };
          }
          return comment;
        });
        return { ...post, comments: updatedComments };
      }
      return post;
    }));
  };

  // Handle create new post
  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    const newPost: ForumPost = {
      id: `p${Date.now()}`,
      title: newPostTitle,
      content: newPostContent,
      author: {
        name: 'You',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        role: 'Member'
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      tags: newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };
    
    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostTags('');
    setIsCreatingPost(false);
  };

  // Handle add comment
  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newCommentObj: Comment = {
          id: `c${Date.now()}`,
          content: newComment,
          author: {
            name: 'You',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
          },
          createdAt: new Date().toISOString(),
          likes: 0
        };
        
        return {
          ...post,
          comments: [...post.comments, newCommentObj]
        };
      }
      return post;
    }));
    
    setNewComment('');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const filterPosts = (filter: string) => {
    setActiveFilter(filter);
    let filteredPosts = [...posts];
    
    if (filter === 'latest') {
      filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filter === 'popular') {
      filteredPosts.sort((a, b) => b.likes - a.likes);
    } else if (filter === 'discussed') {
      filteredPosts.sort((a, b) => b.comments.length - a.comments.length);
    }
    
    setPosts(filteredPosts);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Forum</h1>
        <p className="text-gray-600">Join discussions with other creators and share your experiences</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Forum Area */}
        <div className="lg:w-3/4">
          {/* Create Post Button & Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreatingPost(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={18} />
              <span>Create New Post</span>
            </motion.button>
            
            <div className="flex items-center gap-2 bg-white rounded-lg border shadow-sm p-1">
              <button 
                onClick={() => filterPosts('latest')}
                className={`px-3 py-1.5 rounded-md text-sm ${activeFilter === 'latest' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Latest
              </button>
              <button 
                onClick={() => filterPosts('popular')}
                className={`px-3 py-1.5 rounded-md text-sm ${activeFilter === 'popular' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Popular
              </button>
              <button 
                onClick={() => filterPosts('discussed')}
                className={`px-3 py-1.5 rounded-md text-sm ${activeFilter === 'discussed' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Most Discussed
              </button>
            </div>
          </div>
          
          {/* Create Post Form */}
          {isCreatingPost && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 mb-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Create a New Post</h2>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's your topic about?"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  id="content"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts, questions, or ideas..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                ></textarea>
              </div>
              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  id="tags"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="comics, illustration, feedback"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsCreatingPost(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreatePost}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Post
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Forum Posts */}
          <div className="space-y-6">
            {posts.map(post => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name} 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{post.author.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded mr-2">
                            {post.author.role}
                          </span>
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{post.title}</h2>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Post Actions */}
                  <div className="flex items-center text-gray-500 border-t border-gray-100 pt-4">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center mr-4 hover:text-gray-700 ${post.liked ? 'text-red-500 hover:text-red-600' : ''}`}
                    >
                      <Heart size={18} className={`mr-1 ${post.liked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <button 
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="flex items-center hover:text-gray-700"
                    >
                      <MessageCircle size={18} className="mr-1" />
                      <span>{post.comments.length} Comments</span>
                    </button>
                  </div>
                </div>
                
                {/* Comments Section */}
                {expandedPost === post.id && (
                  <div className="bg-gray-50 p-6 border-t border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-4">Comments</h3>
                    
                    {/* Comment List */}
                    <div className="space-y-4 mb-4">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <img 
                            src={comment.author.avatar} 
                            alt={comment.author.name} 
                            className="w-8 h-8 rounded-full mt-1"
                          />
                          <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex justify-between">
                              <div className="font-medium text-gray-900 text-sm">
                                {comment.author.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                            <div className="mt-2 flex items-center">
                              <button 
                                onClick={() => handleLikeComment(post.id, comment.id)}
                                className={`flex items-center text-xs hover:text-gray-700 ${comment.liked ? 'text-blue-500 hover:text-blue-600' : 'text-gray-500'}`}
                              >
                                <ThumbsUp size={14} className="mr-1" />
                                <span>{comment.likes} likes</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Comment */}
                    <div className="flex gap-3">
                      <img 
                        src="https://randomuser.me/api/portraits/men/1.jpg" 
                        alt="Your avatar" 
                        className="w-8 h-8 rounded-full mt-1"
                      />
                      <div className="flex-1 relative">
                        <textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                        ></textarea>
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          className="absolute right-3 bottom-3 text-blue-600 hover:text-blue-700"
                          disabled={!newComment.trim()}
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:w-1/4">
          {/* Community Stats */}
          <div className="bg-white rounded-lg shadow-md p-5 mb-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Members</span>
                <span className="font-medium">2,543</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Topics</span>
                <span className="font-medium">685</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Posts</span>
                <span className="font-medium">4,271</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Online now</span>
                <span className="font-medium">42</span>
              </div>
            </div>
          </div>
          
          {/* Popular Tags */}
          <div className="bg-white rounded-lg shadow-md p-5 mb-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">#comics</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">#illustration</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">#storytelling</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">#AI</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">#characterdesign</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">#feedback</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">#tutorial</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">#beginner</span>
            </div>
          </div>
          
          {/* Top Contributors */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Top Contributors</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <img 
                  src="https://randomuser.me/api/portraits/women/44.jpg" 
                  alt="Jamie Lee" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-medium text-gray-900">Jamie Lee</h4>
                  <p className="text-sm text-gray-500">127 posts</p>
                </div>
              </div>
              <div className="flex items-center">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Alex Morgan" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-medium text-gray-900">Alex Morgan</h4>
                  <p className="text-sm text-gray-500">96 posts</p>
                </div>
              </div>
              <div className="flex items-center">
                <img 
                  src="https://randomuser.me/api/portraits/women/29.jpg" 
                  alt="Sophia Williams" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-medium text-gray-900">Sophia Williams</h4>
                  <p className="text-sm text-gray-500">82 posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;