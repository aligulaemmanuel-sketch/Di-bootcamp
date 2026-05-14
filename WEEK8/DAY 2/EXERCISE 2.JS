import React from 'react';
import posts from './data.json';

const PostList = () => {
  return (
    <div>
      <h1>Hi, This is a Title</h1>
      {posts.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default PostList;
 