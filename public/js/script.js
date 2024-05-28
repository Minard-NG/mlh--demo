const socket = io();
const postContainer = document.querySelector('.post-container');
const postForm = document.getElementById('post-form');
const currentUserId = document.getElementById('currentUserId') ? document.getElementById('currentUserId').value : null;

socket.on('newPost', (post) => {
  console.log('DEBUG: new post alert!', post);
  updatePosts(post);
});

postForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission

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
      return; // Do not insert the post if not so
    }

    const newPostHtml = `
    <div class="post">
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
          <button id="margin_t"  type="submit">Comment</button>
        </form>
      </div>
    </div>
  `;
    postContainer.insertAdjacentHTML('afterbegin', newPostHtml);
  } catch (error) {
    console.error('Error:', error);
  }
}
