const socket = io();
const postContainer = document.querySelector('.post-container');
const postForm = document.getElementById('post-form');
const currentUserId = document.getElementById('currentUserId') ? document.getElementById('currentUserId').value : null;

document.addEventListener('DOMContentLoaded', () => {
  // Use event delegation for like button clicks
  postContainer.addEventListener('click', async (event) => {
    if (event.target.classList.contains('like-button')) {
      const postId = event.target.getAttribute('data-post-id');

      try {
        const response = await fetch(`/posts/${postId}/like`, {
          method: 'POST',
        });

        const data = await response.json();

        if (data.success) {
          event.target.textContent = `Like (${data.post.likes})`;
        } else {
          console.error('Error liking post:', data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });

  socket.on('newPost', (post) => {
    console.log('DEBUG: new post alert!', post);
    updatePosts(post);
  });

  postForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(postForm);

    try {
      const response = await fetch('/posts/create', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Clear the form fields
        postForm.reset();
      } else {
        // Handle the error response
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  function updatePosts(post) {
    try {
      // Check if the current user is allowed to see the post
      if (post.visibility && post.visibility[currentUserId] === true) {
        return; // Do not insert the post if the user is not allowed to see it
      }

      const newPostHtml = `
        <div class="post" data-post-id="${post._id}">
          <h3>${post.author.username}</h3>
          <p>${post.content}</p>
          ${post.image ? `<img class="post-image" src="data:${post.imageMimeType};base64, ${post.image}" alt="Post Image" />` : ''}
          <div class="post-actions">
            <button class="like-button" data-post-id="${post._id}">Like (${post.likes})</button>
            <button class="comment-button" data-post-id="${post._id}">Comment (${post.comments.length})</button>
          </div>
          <div class="comments">
            <form action="/posts/${post._id}/comment" method="post">
              <input type="text" name="content" placeholder="Add a comment" required />
              <button id="margin_t" type="submit">Comment</button>
            </form>
          </div>
        </div>
      `;
      postContainer.insertAdjacentHTML('afterbegin', newPostHtml);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  socket.on('postLiked', (data) => {
    const postElement = document.querySelector(`[data-post-id="${data.postId}"]`);

    if (postElement) {
      const likeButton = postElement.querySelector('.like-button');
      if (likeButton) {
        likeButton.textContent = `Like (${data.likes})`;
      } else {
        console.error(`Like button not found for post ID ${data.postId}`);
      }
    } else {
      console.error(`Post element not found for post ID ${data.postId}`);
    }
  });
});
