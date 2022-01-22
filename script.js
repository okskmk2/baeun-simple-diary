
let isEditMode = false;

window.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key == 'Enter') {
        addPost();
    }
});

// THIS IS WHAT YOU NEED
const countWithRegex = (str, regexStr) => {
    return ((str || '').match(new RegExp(regexStr, 'g')) || []).length
}

function textareaShortCutKey($textarea, saveFn, cancelFn) {
    $textarea.addEventListener('keydown', function (e) {
        if (e.key == "Escape") {
            e.preventDefault();
            cancelFn();
        }

        else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveFn();
        }

        if ($textarea.offsetHeight < $textarea.scrollHeight) {
            $textarea.style.height = ($textarea.scrollHeight + 16) + 'px';
        }

    });
}

function now() {
    return new Date().toLocaleString();
}

function generatePostNum() {
    if (!localStorage.getItem('post_seq')) {
        localStorage.setItem('post_seq', 0);
    }
    let seq = parseInt(localStorage.getItem('post_seq'));
    let next_seq = ++seq;
    return next_seq;
}

const posts_container = document.getElementById('posts_container');

function updatePost() {
    const article = this;
    const postId = parseInt(article.dataset.postId);
    const title_input = article.querySelector('.title_div textarea');

    const posts = JSON.parse(localStorage.getItem('posts'));
    let postIndex = -1;
    let post = null;
    for (let index = 0; index < posts.length; index++) {
        const element = posts[index];
        if (element.id === postId) {
            postIndex = index;
            post = element;
            break;
        }
    }
    posts[postIndex] = Object.assign(post, { title: title_input.value, updateAt: now() });

    localStorage.setItem('posts', JSON.stringify(posts));
    loadPosts();
}


function renderUpdatePostInput() {
    console.log("renderUpdatePostInput");
    if (isEditMode) {
        console.log(message.already);
        return;
    }
    isEditMode = true;
    const article = this;

    // 수정 버튼 감추기
    const update_button = article.querySelector('.update_button');
    update_button.classList.add('hide');

    // 삭제 버튼 감추기
    const delete_button = article.querySelector('.delete_button');
    delete_button.classList.add('hide');

    // 취소 버튼 보이기
    const cancel_button = article.querySelector('.cancel_button');
    cancel_button.classList.remove('hide');

    // 수정2 버튼 보이기
    const update_button2 = article.querySelector('.update_button2');
    update_button2.classList.remove('hide');

    const title_div = article.querySelector('.title_div');
    const title = title_div.innerHTML;
    const title_input = document.createElement('textarea');
    textareaShortCutKey(title_input, updatePost.bind(article), loadPosts);
    title_input.value = title;
    let lineCount = countWithRegex(title, '\n');
    title_input.style.height = ((lineCount * 24) + 16) + 'px';
    title_div.innerHTML = null;
    title_div.appendChild(title_input);
    title_input.focus();
}

function deletePost() {
    let answer = confirm(message.deleteConfirm);
    if (answer) {
        const article = this.parentElement.parentElement.parentElement;
        const postId = parseInt(article.dataset.postId);
        let posts = JSON.parse(localStorage.getItem('posts'));
        posts = posts.filter(v => v.id !== postId);
        localStorage.setItem('posts', JSON.stringify(posts));
        loadPosts();
    }
}

function renderPost(post) {
    const article = document.createElement('article');
    article.classList.add('post-item');
    article.dataset.postId = post.id;
    // title_div
    const title_div = document.createElement('div');
    title_div.classList.add('title_div');
    title_div.innerHTML = post.title;


    // action_div
    const action_div = document.createElement('div');
    action_div.className = 'post-button-group';

    // update_button
    const update_button = document.createElement('button');
    update_button.classList.add('update_button');
    update_button.addEventListener('click', renderUpdatePostInput.bind(article));
    update_button.innerHTML = message.update;
    action_div.appendChild(update_button);

    // delete_button
    const delete_button = document.createElement('button');
    delete_button.classList.add('delete_button');
    delete_button.addEventListener('click', deletePost);
    delete_button.innerHTML = message.delete;
    action_div.appendChild(delete_button);

    // cancel_button
    const cancel_button = document.createElement('button');
    cancel_button.classList.add('cancel_button')
    cancel_button.classList.add('hide');
    cancel_button.addEventListener('click', loadPosts);
    cancel_button.innerHTML = message.cancel;
    action_div.appendChild(cancel_button);

    // real_update_button2
    const update_button2 = document.createElement('button');
    update_button2.classList.add('update_button2');
    update_button2.classList.add('hide');
    update_button2.addEventListener('click', updatePost.bind(article));
    update_button2.innerHTML = message.save;
    action_div.appendChild(update_button2);

    const post_inner = document.createElement('div');
    post_inner.classList.add('post-inner');

    const meta_data_div = document.createElement('div');
    const createAt_div = document.createElement('div');
    createAt_div.classList.add('create-at');
    createAt_div.innerHTML = post.createAt;
    meta_data_div.classList.add('meta-data');
    meta_data_div.appendChild(createAt_div);
    post_inner.appendChild(meta_data_div);
    post_inner.appendChild(title_div);
    post_inner.appendChild(action_div);
    article.appendChild(post_inner);
    return article;
}

function loadPosts() {
    console.log("loadPosts");
    posts_container.innerHTML = null;
    if (!localStorage.getItem('posts')) {
        localStorage.setItem('posts', '[]');
    }
    const posts = JSON.parse(localStorage.getItem('posts'));
    for (const post of posts) {
        const article = renderPost(post);
        posts_container.appendChild(article);
    }
    isEditMode = false;
}

const add_button = document.getElementById('add_button');

function savePost() {
    console.log("savePost");
    const article = this;
    const title_input = article.querySelector('textarea');
    const title = title_input.value;
    const id = generatePostNum();
    if (!localStorage.getItem('posts')) {
        localStorage.setItem('posts', '[]');
    }
    const posts = JSON.parse(localStorage.getItem('posts'));
    posts.unshift({ id, title, createAt: now() });
    localStorage.setItem('posts', JSON.stringify(posts));
    localStorage.setItem('post_seq', id);
    loadPosts();
}

function renderNewPostInput() {
    const article = document.createElement('article');
    article.classList.add('post-item');

    const title_div = document.createElement('div');
    const title_input = document.createElement('textarea');
    textareaShortCutKey(title_input, savePost.bind(article), loadPosts);
    title_div.appendChild(title_input);

    // action_div
    const action_div = document.createElement('div');
    action_div.className = 'post-button-group';

    // cancel_button
    const cancel_button = document.createElement('button');
    cancel_button.classList.add('cancel_button')
    cancel_button.addEventListener('click', loadPosts);
    cancel_button.innerHTML = message.cancel;
    action_div.appendChild(cancel_button);

    // save_button
    const save_button = document.createElement('button');
    save_button.innerHTML = message.save;
    save_button.addEventListener('click', savePost.bind(article));
    action_div.appendChild(save_button);

    const post_inner = document.createElement('div');
    post_inner.classList.add('post-inner');
    post_inner.appendChild(title_div);
    post_inner.appendChild(action_div);
    article.appendChild(post_inner);
    return article;
}

function addPost() {
    if (isEditMode) {
        console.log(message.already);
        return;
    }
    isEditMode = true;
    const article = renderNewPostInput();
    if (posts_container.firstElementChild) {
        posts_container.insertBefore(article, posts_container.firstElementChild);
    } else {
        posts_container.appendChild(article);
    }
    article.querySelector('textarea').focus();
}

add_button.addEventListener('click', addPost);

const help_button = document.getElementById('help_button');

help_button.addEventListener('click', function () {
    alert(message.help);
})

loadPosts();