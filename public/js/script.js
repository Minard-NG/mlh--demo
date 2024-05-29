const socket = io();
const postContainer = document.querySelector('.post-container');
const postForm = document.getElementById('post-form');
const currentUserId = document.getElementById('currentUserId') ? document.getElementById('currentUserId').value : null;

document.addEventListener('DOMContentLoaded', () => {
  function updatePosts(post) {
    try {
      // Check if the current user is allowed to see the post
      if (post.visibility && post.visibility[currentUserId] === true) {
        return; // Do not insert the post if not so
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
        <div class="comments" id="comments-${post._id}">
          <form action="/posts/${post._id}/comment" method="post">
            <input type="text" name="content" placeholder="Add a comment" required />
            <button type="submit">Comment</button>
          </form>
        </div>
      </div>
    `;
      postContainer.insertAdjacentHTML('afterbegin', newPostHtml);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  socket.on('newPost', (post) => {
    console.log('it hanot broken', post);
    updatePosts(post);
  });

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

  socket.on('newComment', (data) => {
    const commentsSection = document.querySelector(`#comments-${data.postId}`);
    if (commentsSection) {
      const newComment = document.createElement('div');
      newComment.classList.add('comment');
      newComment.id = `comment-${data.comment._id}`;
      newComment.innerHTML = `
        <p><strong>${data.comment.userId.username}:</strong> ${data.comment.content}</p>
        <div class="replies" id="replies-${data.comment._id}">
          <form action="/posts/comment/${data.comment._id}/reply" method="post">
            <input type="text" name="content" placeholder="Reply" required />
            <button class="margin_t" type="submit">Reply</button>
          </form>
        </div>
      `;

      const commentForm = commentsSection.querySelector('form[action$="/comment"]');
      if (commentForm) {
        commentsSection.insertBefore(newComment, commentForm);
      } else {
        commentsSection.appendChild(newComment);
      }

      // Update the comment count in the comment-button
      const commentButton = document.querySelector(`.comment-button[data-post-id="${data.postId}"]`);
      if (commentButton) {
        const commentCountMatch = commentButton.textContent.match(/\d+/);
        if (commentCountMatch) {
          const commentCount = parseInt(commentCountMatch[0], 10);
          commentButton.textContent = `Comment (${commentCount + 1})`;
        }
      }
    }
  });

  socket.on('newReply', (data) => {
    const repliesSection = document.querySelector(`#replies-${data.commentId}`);
    if (repliesSection) {
      const newReply = document.createElement('div');
      newReply.classList.add('reply');
      newReply.id = `reply-${data.reply._id}`;
      newReply.innerHTML = `
        <p><strong>${data.reply.userId.username}:</strong> ${data.reply.content}</p>
      `;
      repliesSection.insertAdjacentElement('afterbegin', newReply);
    }
  });

  postContainer.addEventListener('click', async (event) => {
    if (event.target.classList.contains('like-button')) {
      const postId = event.target.getAttribute('data-post-id');

      try {
        const response = await fetch(`/posts/${postId}/like`, { method: 'POST' });
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

  postForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(postForm);

    try {
      const response = await fetch('/posts/create', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        postForm.reset();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  document.addEventListener('submit', async (event) => {
    if (event.target.matches('form[action^="/posts/"][action$="/comment"]')) {
      event.preventDefault();

      const formData = new FormData(event.target);
      const actionUrl = event.target.action;

      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      try {
        const response = await axios.post(actionUrl, data, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        if (response.data.success) {
          event.target.reset();
        } else {
          alert(response.data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });

  postContainer.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;

    if (form.matches('form[action^="/posts/comment/"][action$="/reply"]')) {
      const formData = new FormData(form);
      const actionUrl = form.action;

      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      try {
        const response = await axios.post(actionUrl, data, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        if (response.data.success) {
          event.target.reset();
        } else {
          alert(response.data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });
});
