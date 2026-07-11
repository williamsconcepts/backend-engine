const API = "http://localhost:4000";

const socket = io(API);

/* ===========================
   SERVER TIME (SSE)
=========================== */

const timeElement = document.getElementById("server-time");

const eventSource = new EventSource(API + "/sse");

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  timeElement.innerText = data.date + " " + data.time;
};

/* ===========================
   AUTHENTICATION
=========================== */

const modal = document.getElementById("authModal");

const loginBtn = document.getElementById("loginOpenBtn");

const registerBtn = document.getElementById("registerOpenBtn");

const closeBtn = document.querySelector(".close-modal");

const submitBtn = document.getElementById("submitAuth");

const modalTitle = document.getElementById("modalTitle");

const registerFields = document.getElementById("registerFields");

const logoutBtn = document.getElementById("logoutBtn");

const titleInput = document.getElementById("title");

const contentInput = document.querySelector(".editor-content");

const categoryInput = document.getElementById("category");

const publishBtn = document.getElementById("publishBtn");

const postsContainer = document.getElementById("postsContainer");

const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
const chatMessages = document.getElementById("chatMessages");

const chatWidget = document.getElementById("chatWidget");
const chatToggle = document.getElementById("chatToggle");
const closeChat = document.getElementById("closeChat");

let mode = "login";

if (logoutBtn) {
  logoutBtn.onclick = () => {
    localStorage.removeItem("accessToken");
    location.reload();
  };
}

loginBtn.onclick = () => {
  mode = "login";

  modal.classList.add("active");

  modalTitle.innerText = "Login";

  submitBtn.innerText = "Login";

  registerFields.style.display = "none";
};

registerBtn.onclick = () => {
  mode = "register";

  modal.classList.add("active");

  modalTitle.innerText = "Register";

  submitBtn.innerText = "Create Account";

  registerFields.style.display = "block";
};

closeBtn.onclick = () => {
  modal.classList.remove("active");
};

submitBtn.onclick = async () => {
  const email = document.getElementById("email").value;

  const password = document.getElementById("password").value;

  const name = document.getElementById("name").value;

  let url = "/user/login";

  let body = { email, password };

  if (mode === "register") {
    url = "/user/create";

    body = {
      name,

      email,

      password,
    };
  }

  const req = await fetch(API + url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(body),
  });

  const res = await req.json();

  document.getElementById("authMessage").innerText = res.message;

  if (req.ok && mode === "login") {
    localStorage.setItem("accessToken", res.accessToken);

    localStorage.setItem("user", JSON.stringify(res.user));

    loginSuccess(res.user);

    loadCategories();

    loadPosts();

    loadPopularPosts();

    modal.classList.remove("active");
  }
};

function loginSuccess(user) {
  loginBtn.style.display = "none";
  registerBtn.style.display = "none";

  document.getElementById("userMenu").style.display = "flex";

  document.getElementById("userName").innerText = user.name;

  document.getElementById("createPostCard").style.display = "block";

  document.getElementById("avatar").innerText = user.name
    .substring(0, 2)
    .toUpperCase();
}

const token = localStorage.getItem("accessToken");

const user = JSON.parse(localStorage.getItem("user"));

if (token && user) {
  loginSuccess(user);

  loadCategories();

  loadPosts();

  loadPopularPosts();
}

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("accessToken");

  location.reload();
};

// chat box

chatToggle.onclick = () => {
  chatWidget.classList.remove("collapsed");
  chatToggle.style.display = "none";
};

closeChat.onclick = () => {
  chatWidget.classList.add("collapsed");

  chatToggle.style.display = "flex";
};

sendChatBtn.onclick = () => {
  const text = chatInput.value.trim();

  if (!text) return;

  const user = JSON.parse(atob(localStorage.getItem("accessToken")));

  socket.emit("chat-message", {
    user: user.name,
    text: text,
  });

  chatInput.value = "";
};

socket.on("chat-message", (message) => {
  chatMessages.innerHTML += `
            <div class="message">

            <strong>${message.user}</strong>

            <p>${message.text}</p>

            <small>${message.time}</small>

        </div>
        
  `;
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendChatBtn.click();
  }
});

/* ===========================
   CATEGORIES
=========================== */

async function loadCategories() {
  const token = localStorage.getItem("accessToken");

  if (!token) return;

  try {
    const req = await fetch(`${API}/categories`, {
      headers: {
        Authorization: token,
      },
    });

    if (!req.ok) {
      const error = await req.json();
      console.log(error);
      alert(error.message);
      return;
    }

    const categories = await req.json();

    console.log("Categories:", categories);

    const categorySelect = document.getElementById("category");
    const categoryList = document.getElementById("categoryList");

    // Populate dropdown
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Select a category</option>';

      categories.forEach((category) => {
        const option = document.createElement("option");

        option.value = category.id;

        option.textContent = category.title;

        categorySelect.appendChild(option);
      });
    }

    // Populate sidebar
    if (categoryList) {
      categoryList.innerHTML =
        '<div class="category-item active">All Posts</div>';

      categories.forEach((category) => {
        const div = document.createElement("div");

        div.className = "category-item";

        div.dataset.id = category.id;

        div.textContent = category.title;

        div.addEventListener("click", () => {
          document
            .querySelectorAll(".category-item")
            .forEach((item) => item.classList.remove("active"));

          div.classList.add("active");

          console.log("Selected category:", category.id);
        });

        categoryList.appendChild(div);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

/* ===========================
   POSTS
=========================== */

publishBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    alert("Please login first.");

    return;
  }

  const title = titleInput.value.trim();

  const postContent = contentInput.innerText.trim();

  const categoryId = categoryInput.value;

  if (!title || !postContent || !categoryId) {
    alert("Please complete all fields.");

    return;
  }

  try {
    const req = await fetch(`${API}/posts/create`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: token,
      },

      body: JSON.stringify({
        title,

        postContent,

        categoryId,
      }),
    });

    const res = await req.json();

    alert(res.message);

    if (req.ok) {
      titleInput.value = "";

      contentInput.innerHTML = "";

      categoryInput.selectedIndex = 0;

      loadPosts();
    }
  } catch (error) {
    console.log(error);
  }
});

async function loadPosts() {
  const token = localStorage.getItem("accessToken");

  if (!token) return;

  try {
    const req = await fetch(`${API}/posts`, {
      headers: {
        Authorization: token,
      },
    });

    const posts = await req.json();

    console.log(posts);

    if (!req.ok) {
      console.error(posts);
      alert(posts.message || "Failed to load posts");
      return;
    }

    if (!Array.isArray(posts)) {
      console.error(posts);
      return;
    }

    postsContainer.innerHTML = "";

    posts.forEach((post) => {
      const article = document.createElement("article");

      article.className = "card";

      article.innerHTML = `
                <div class="post-header-row">
                    <div>
                        <h3 class="post-title">${post.title}</h3>

                        <div class="post-meta">
                            📅 ${new Date(post.created_at).toLocaleDateString()}
                            &nbsp;&bull;&nbsp;
                            📂 ${post.category}
                        </div>
                    </div>
                </div>

                <p class="post-body">
                    ${post.postContent}
                </p>

               <div class="post-actions">

    <button
        class="btn btn-outline like-btn"
        onclick="likePost(${post.id})"
    >
        ❤️ ${post.likes} Likes
    </button>

    <span>
        💬 ${post.comments.length} Comments
    </span>

</div>

                <div class="comments">

    <h4>Comments</h4>

    ${
      post.comments.length
        ? post.comments
            .map(
              (comment) => `
            <div class="comment">

                <strong>${comment.userName}</strong>

                <p>${comment.comment}</p>

            </div>
        `,
            )
            .join("")
        : "<p>No comments yet.</p>"
    }

<div class="comment-form">

    <textarea
        id="comment-${post.id}"
        placeholder="Write a comment..."
    ></textarea>

    <button
        class="btn btn-primary"
        onclick="addComment(${post.id})">
        Post Comment
    </button>

</div>

</div>
            `;

      postsContainer.appendChild(article);
    });
  } catch (err) {
    console.log(err);
  }
}

/* ===========================
   POPULAR POSTS
=========================== */
async function loadPopularPosts() {
  try {
    const req = await fetch(`${API}/posts/popular`);

    const posts = await req.json();

    const popular = document.getElementById("popularPosts");

    popular.innerHTML = "";

    posts.forEach((post) => {
      popular.innerHTML += `

                <div class="popular-post">

                    <div>

                        <p class="popular-post-title">

                            ${post.title}

                        </p>

                        <p class="popular-post-date">

                            ❤️ ${post.likes} Likes

                        </p>

                    </div>

                </div>

            `;
    });
  } catch (error) {
    console.log(error);
  }
}

/* ===========================
   COMMENTS
=========================== */

async function addComment(postId) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    alert("Please login.");
    return;
  }

  const comment = document.getElementById(`comment-${postId}`).value.trim();

  if (!comment) {
    alert("Please enter a comment.");
    return;
  }

  try {
    const req = await fetch(`${API}/comment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        postId,
        comment,
      }),
    });

    const res = await req.json();

    alert(res.message);

    if (req.ok) {
      loadPosts();
    }
  } catch (error) {
    console.log(error);
  }
}

/* ===========================
   LIKES
=========================== */

async function likePost(id) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    alert("Please login.");

    return;
  }

  try {
    const req = await fetch(`${API}/posts/${id}/like`, {
      method: "PATCH",

      headers: {
        Authorization: token,
      },
    });

    const res = await req.json();

    if (req.ok) {
      loadPosts();

      loadPopularPosts();
    }
  } catch (error) {
    console.log(error);
  }
}
