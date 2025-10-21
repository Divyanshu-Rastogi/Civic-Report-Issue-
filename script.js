document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navItems = document.querySelectorAll('.nav-item');
    const themeToggle = document.getElementById('theme-toggle');

    // Sample data (in a real app, this would come from a backend)
    const issuePosts = [
        { id: 1, imageId: 'pothole-img', description: 'Large pothole filled with water causing traffic slowdown and vehicle damage.', location: 'FC Road, Pune', upvotes: 30, isUpvoted: false, comments: [] },
        { id: 2, imageId: 'lost-pet-img', description: 'Lost golden retriever near ABC Park. Please contact if seen!', location: 'Baner, Pune', upvotes: 15, isUpvoted: false, comments: [] },
        { id: 3, imageId: 'construction-dust-img', description: 'Excessive construction dust from demolition site causing health issues.', location: 'Camp, Pune', upvotes: 20, isUpvoted: false, comments: [] },
        { id: 4, imageId: 'streetlight-img', description: 'Damaged streetlight near school making area unsafe at night.', location: 'Hadapsar, Pune', upvotes: 18, isUpvoted: false, comments: [] },
        { id: 5, imageId: 'garbage-img', description: 'Piles of garbage accumulating near market attracting pests.', location: 'Swargate, Pune', upvotes: 28, isUpvoted: false, comments: [] },
        { id: 6, imageId: 'water-leakage-img', description: 'Continuous water leakage from pipe on main road wasting water.', location: 'Deccan Gymkhana, Pune', upvotes: 22, isUpvoted: false, comments: [] },
    ];

    const userPosts = {
        inProcess: [],
        completed: []
    };

    function renderPage(page) {
        mainContent.innerHTML = ''; // Clear previous content
        navItems.forEach(item => item.classList.remove('active'));
        const activeItem = document.querySelector(`[data-page="${page}"]`);
        if (activeItem) activeItem.classList.add('active');

        if (page === 'home') {
            renderHomePage();
        } else if (page === 'search') {
            renderSearchPage();
        } else if (page === 'post') {
            renderPostPage();
        } else if (page === 'chatbot') {
            renderChatbotPage();
        } else if (page === 'profile') {
            renderProfilePage();
        }
    }

    function renderHomePage() {
        const sortedPosts = [...issuePosts].sort((a, b) => b.upvotes - a.upvotes);
        const homeHTML = sortedPosts.map(post => {
            let imageSrc = '';
            if (post.imageId) {
                const imageElement = document.getElementById(post.imageId);
                imageSrc = imageElement ? imageElement.src : '';
            } else if (post.image) {
                imageSrc = post.image;
            }
            return `
            <div class="issue-post" data-id="${post.id}">
                <div class="post-image">
                    <img src="${imageSrc}" alt="Issue Image">
                </div>
                <div class="post-info">
                    <p>${post.description}</p>
                    <div class="post-location">${post.location}</div>
                </div>
                <div class="post-actions">
                    <button class="upvote-btn ${post.isUpvoted ? 'upvoted' : ''}">
                        <i class="fas fa-arrow-up"></i>
                        <span class="upvote-count">${post.upvotes}</span>
                    </button>
                    <button class="comment-btn">
                        <i class="fas fa-comment"></i>
                        <span>Comments (${post.comments.length})</span>
                    </button>
                </div>
                <div class="comments" hidden>
                    <div class="comment-list">
                        ${post.comments.map(c => `
                            <div class="comment-item">
                                <div class="comment-text">${c.text}</div>
                                ${c.image ? `<img class="comment-image" src="${c.image}" alt="comment image">` : ''}
                            </div>
                        `).join('')}
                        ${post.comments.length === 0 ? '<div class="comment-empty">No comments yet. Be the first to comment.</div>' : ''}
                    </div>
                    <div class="comment-form">
                        <input class="comment-input" type="text" placeholder="Add a comment..." />
                        <input class="comment-file" type="file" accept="image/*" hidden />
                        <button class="comment-attach" title="Attach image"><i class="fas fa-image"></i></button>
                        <button class="comment-send" title="Send"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
        mainContent.innerHTML = `<h2 style="margin: 6px 6px 12px;">Community Issues</h2>` + homeHTML;

        // Add event listeners for upvoting
        document.querySelectorAll('.upvote-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const postElement = e.currentTarget.closest('.issue-post');
                const postId = parseInt(postElement.dataset.id);
                const post = issuePosts.find(p => p.id === postId);

                if (post) {
                    if (post.isUpvoted) {
                        post.upvotes--;
                        post.isUpvoted = false;
                    } else {
                        post.upvotes++;
                        post.isUpvoted = true;
                    }
                    // Re-render to update counts and maintain sorting by upvotes
                    renderHomePage();
                }
            });
        });

        // Toggle comments and handle comment submission
        document.querySelectorAll('.comment-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const postElement = e.currentTarget.closest('.issue-post');
                const commentsEl = postElement.querySelector('.comments');
                if (commentsEl.hasAttribute('hidden')) commentsEl.removeAttribute('hidden');
                else commentsEl.setAttribute('hidden', '');
            });
        });

        document.querySelectorAll('.issue-post').forEach(postEl => {
            const postId = parseInt(postEl.dataset.id);
            const input = postEl.querySelector('.comment-input');
            const fileInput = postEl.querySelector('.comment-file');
            const attachBtn = postEl.querySelector('.comment-attach');
            const sendBtn = postEl.querySelector('.comment-send');
            const list = postEl.querySelector('.comment-list');

            attachBtn.addEventListener('click', () => fileInput.click());
            sendBtn.addEventListener('click', async () => {
                const text = input.value.trim();
                if (!text && !fileInput.files[0]) return;
                let imgData = '';
                if (fileInput.files[0]) imgData = await fileToDataUrl(fileInput.files[0]);
                const post = issuePosts.find(p => p.id === postId);
                post.comments.push({ text, image: imgData });
                input.value = '';
                fileInput.value = '';
                list.innerHTML = post.comments.map(c => `
                    <div class="comment-item">
                        <div class="comment-text">${c.text}</div>
                        ${c.image ? `<img class=\"comment-image\" src=\"${c.image}\" alt=\"comment image\">` : ''}
                    </div>
                `).join('');
                const btn = postEl.querySelector('.comment-btn span');
                if (btn) btn.textContent = `Comments (${post.comments.length})`;
            });
        });

    }

    function renderSearchPage() {
        const searchHTML = `
            <div class="search-container">
                <div class="search-input-wrap" style="position: relative;">
                    <input type="text" placeholder="Search for problems or locations..." class="search-bar" autocomplete="off">
                    <div class="search-suggestions" style="position:absolute; left:0; right:0; top:100%; z-index:10;" hidden></div>
                </div>
                <button class="search-btn">Search</button>
            </div>
            <h2>Search Results</h2>
            <div id="search-results">
                <p>No results yet. Try searching for "pothole" or "Pune".</p>
            </div>
        `;
        mainContent.innerHTML = searchHTML;

        const searchInput = document.querySelector('.search-bar');
        const searchBtn = document.querySelector('.search-btn');
        const resultsEl = document.getElementById('search-results');
        const suggEl = document.querySelector('.search-suggestions');

        const knownLocations = Array.from(new Set([
            'FC Road, Pune',
            'Koregaon Park, Pune',
            'Kothrud, Pune',
            'Baner, Pune',
            'Magarpatta, Pune',
            'Shivajinagar, Pune',
            'Viman Nagar, Pune',
            ...issuePosts.map(p => p.location)
        ]));

        function normalize(text) { return (text || '').toLowerCase(); }

        function getSuggestions(query) {
            const q = normalize(query);
            if (!q) return [];
            return knownLocations.filter(loc => normalize(loc).includes(q)).slice(0, 6);
        }

        function renderSuggestions(items) {
            if (!items.length) { suggEl.innerHTML = ''; suggEl.setAttribute('hidden', ''); return; }
            suggEl.removeAttribute('hidden');
            suggEl.innerHTML = `
                <div style="background: var(--card-bg, #fff); border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; box-shadow: 0 6px 16px rgba(0,0,0,0.08);">
                    ${items.map(i => `
                        <button type="button" class="sugg-item" style="display:block; width:100%; text-align:left; padding:10px 12px; background:none; border:none; cursor:pointer;">
                            <i class="fas fa-location-dot" style="margin-right:8px; opacity:0.8;"></i>${i}
                        </button>
                    `).join('')}
                </div>
            `;
            suggEl.querySelectorAll('.sugg-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    const text = btn.textContent.trim();
                    searchInput.value = text;
                    suggEl.setAttribute('hidden', '');
                    runSearch(text);
                });
            });
        }

        function renderResults(items, query) {
            if (!query) {
                resultsEl.innerHTML = '<p>No results yet. Try searching for "pothole" or "Pune".</p>';
                return;
            }
            if (!items.length) {
                resultsEl.innerHTML = `<p>No matches for "${query}".</p>`;
                return;
            }
            resultsEl.innerHTML = items.map(post => {
                let imageSrc = '';
                if (post.imageId) {
                    const imageElement = document.getElementById(post.imageId);
                    imageSrc = imageElement ? imageElement.src : '';
                } else if (post.image) {
                    imageSrc = post.image;
                }
                return `
                <div class="issue-post" data-id="${post.id}">
                    <div class="post-image">
                        <img src="${imageSrc}" alt="Issue Image">
                    </div>
                    <div class="post-info">
                        <p>${post.description}</p>
                        <div class="post-location">${post.location}</div>
                    </div>
                    <div class="post-actions">
                        <button class="upvote-btn ${post.isUpvoted ? 'upvoted' : ''}">
                            <i class="fas fa-arrow-up"></i>
                            <span class="upvote-count">${post.upvotes}</span>
                        </button>
                        <button class="comment-btn">
                            <i class="fas fa-comment"></i>
                            <span>Comments (${post.comments.length})</span>
                        </button>
                    </div>
                </div>
            `;
            }).join('');
        }

        function runSearch(query) {
            const q = normalize(query);
            const results = issuePosts.filter(p =>
                normalize(p.description).includes(q) || normalize(p.location).includes(q)
            );
            renderResults(results, query);
        }

        // Live search and suggestions
        searchInput.addEventListener('input', () => {
            const q = searchInput.value;
            renderSuggestions(getSuggestions(q));
            runSearch(q);
        });
        searchInput.addEventListener('focus', () => {
            const q = searchInput.value;
            renderSuggestions(getSuggestions(q));
        });
        document.addEventListener('click', (e) => {
            if (!suggEl.contains(e.target) && e.target !== searchInput) {
                suggEl.setAttribute('hidden', '');
            }
        });

        // Button-triggered search
        searchBtn.addEventListener('click', () => runSearch(searchInput.value));
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(searchInput.value); });
    }

    function renderPostPage() {
        const postHTML = `
            <div class="post-form">
                <h2>Report a New Issue</h2>
                <div class="image-upload-options">
                    <button id="camera-btn">
                        <i class="fas fa-camera"></i> Camera
                    </button>
                    <button id="gallery-btn">
                        <i class="fas fa-image"></i> Gallery
                    </button>
                </div>
                <input type="file" id="image-input" accept="image/*" capture="environment" style="display: none;">
                <div id="image-preview" class="image-preview" hidden>
                    <img alt="preview" />
                    <button id="remove-image" class="remove-image" title="Remove"><i class="fas fa-times"></i></button>
                </div>
                <textarea id="post-description" placeholder="Describe the issue..." rows="5"></textarea>
                <div class="location-input enhanced">
                    <div class="location-row">
                        <i class="fas fa-location-dot"></i>
                        <input type="text" id="post-location" placeholder="Location (auto-filled)" disabled>
                        <button id="manual-location-btn" class="secondary">Manual</button>
                    </div>
                    <div class="manual-location" hidden>
                        <select id="location-select">
                            <option value="">Select area (Pune)</option>
                            <option>FC Road, Pune</option>
                            <option>Koregaon Park, Pune</option>
                            <option>Kothrud, Pune</option>
                            <option>Baner, Pune</option>
                            <option>Magarpatta, Pune</option>
                            <option>Shivajinagar, Pune</option>
                            <option>Viman Nagar, Pune</option>
                        </select>
                        <input type="text" id="location-details" placeholder="Landmark / Address details" />
                        <button id="apply-location" class="apply">Apply</button>
                    </div>
                </div>
                <button id="submit-post-btn">Submit Issue</button>
            </div>
        `;
        mainContent.innerHTML = postHTML;

        // In a real app, this would involve using the Geolocation API
        const locationInput = document.getElementById('post-location');
        locationInput.value = 'Capturing location...';
        setTimeout(() => {
            locationInput.value = 'Pune, Maharashtra';
            locationInput.disabled = false;
        }, 1500);

        // Image handling
        const imageInput = document.getElementById('image-input');
        const cameraBtn = document.getElementById('camera-btn');
        const galleryBtn = document.getElementById('gallery-btn');
        const preview = document.getElementById('image-preview');
        const previewImg = preview.querySelector('img');
        const removeBtn = document.getElementById('remove-image');

        cameraBtn.addEventListener('click', () => { imageInput.setAttribute('capture', 'environment'); imageInput.click(); });
        galleryBtn.addEventListener('click', () => { imageInput.removeAttribute('capture'); imageInput.click(); });
        imageInput.addEventListener('change', async () => {
            const file = imageInput.files[0];
            if (!file) return;
            const dataUrl = await fileToDataUrl(file);
            previewImg.src = dataUrl;
            preview.removeAttribute('hidden');
        });
        removeBtn.addEventListener('click', () => {
            imageInput.value = '';
            preview.setAttribute('hidden', '');
            previewImg.src = '';
        });

        // Manual location UI
        const manualBtn = document.getElementById('manual-location-btn');
        const manualBox = document.querySelector('.manual-location');
        const locSelect = document.getElementById('location-select');
        const locDetails = document.getElementById('location-details');
        const applyLoc = document.getElementById('apply-location');
        manualBtn.addEventListener('click', () => {
            if (manualBox.hasAttribute('hidden')) manualBox.removeAttribute('hidden'); else manualBox.setAttribute('hidden', '');
        });
        applyLoc.addEventListener('click', () => {
            const base = locSelect.value || 'Pune';
            const details = locDetails.value.trim();
            locationInput.value = details ? `${base} - ${details}` : base;
            manualBox.setAttribute('hidden', '');
        });

        document.getElementById('submit-post-btn').addEventListener('click', async () => {
            const desc = document.getElementById('post-description').value.trim();
            if (!desc) { alert('Please add a description.'); return; }
            let image = '';
            if (imageInput.files[0]) image = await fileToDataUrl(imageInput.files[0]);
            const newPost = { id: Date.now(), image: image || '', description: desc, location: locationInput.value || 'Pune, Maharashtra', upvotes: 0, isUpvoted: false, comments: [] };
            issuePosts.unshift(newPost);
            alert('Issue submitted! (This is a demo)');
            renderPage('home');
        });
    }

    function renderChatbotPage() {
        const chatbotHTML = `
            <div class="chatbot-container">
                <div class="chat-header">
                    <div class="chat-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="chat-info">
                        <h3>Issue Reporter Assistant</h3>
                        <span class="chat-status">Online</span>
                    </div>
                </div>
                <div class="chat-window" id="chat-window">
                    <div class="message-group bot">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <div class="message-bubble bot">
                                Hi! 👋 I'm here to help you with community issues. How can I assist you today?
                            </div>
                            <div class="message-time">Just now</div>
                        </div>
                    </div>
                </div>
                <div class="quick-replies">
                    <button class="quick-reply-btn" data-q="report-something">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Report Something</span>
                    </button>
                    <button class="quick-reply-btn" data-q="where-is-issue">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Location Help</span>
                    </button>
                    <button class="quick-reply-btn" data-q="how-to-use">
                        <i class="fas fa-question-circle"></i>
                        <span>How to Use</span>
                    </button>
                    <button class="quick-reply-btn" data-q="how-to-post">
                        <i class="fas fa-plus"></i>
                        <span>Report Issue</span>
                    </button>
                    <button class="quick-reply-btn" data-q="other">
                        <i class="fas fa-comments"></i>
                        <span>Other Help</span>
                    </button>
                </div>
                <div class="chat-input-container">
                    <div class="chat-input-row">
                        <input id="chat-input" type="text" placeholder="Type your message..." />
                        <button id="chat-send" class="send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        mainContent.innerHTML = chatbotHTML;

        const chatWindow = document.getElementById('chat-window');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        
        const addMessage = (text, isBot = true, showAvatar = true) => {
            const messageGroup = document.createElement('div');
            messageGroup.className = `message-group ${isBot ? 'bot' : 'user'}`;
            
            const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            messageGroup.innerHTML = `
                ${showAvatar ? `<div class="message-avatar">
                    <i class="fas fa-${isBot ? 'robot' : 'user'}"></i>
                </div>` : ''}
                <div class="message-content">
                    <div class="message-bubble ${isBot ? 'bot' : 'user'}">${text}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
            
            chatWindow.appendChild(messageGroup);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        };

        const reply = (key) => {
            addMessage(getUserPrompt(key), false);
            setTimeout(() => {
                addMessage(getBotReply(key), true);
            }, 1000);
        };

        document.querySelectorAll('.quick-reply-btn').forEach(b => {
            b.addEventListener('click', () => reply(b.dataset.q));
        });

        chatSend.addEventListener('click', () => {
            const text = chatInput.value.trim();
            if (!text) return;
            addMessage(text, false);
            chatInput.value = '';
            
            setTimeout(() => {
                const key = inferKeyFromText(text);
                addMessage(getBotReply(key), true);
            }, 1000);
        });

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') chatSend.click();
        });
    }
    
    // Chatbot helpers
    const getBotReply = (option) => {
        switch (option) {
            case 'report-something':
                return 'I can help you report various issues! Here are common problems you can report:\n\n🚧 **Infrastructure Issues:**\n• Potholes and road damage\n• Broken streetlights\n• Water leakage\n• Garbage collection problems\n\n🐕 **Community Issues:**\n• Lost pets\n• Noise complaints\n• Construction dust\n\n📱 **How to Report:**\n1. Tap the + button at the bottom\n2. Take a photo or select from gallery\n3. Describe the issue\n4. Confirm location\n5. Submit\n\nWhat type of issue would you like to report?';
            case 'where-is-issue':
                return 'We use your device\'s location when you upload an image. You can also set it manually in the report form via Manual > select area + details.';
            case 'how-to-use':
                return 'Use the bottom bar: Home lists issues, Search filters by problem/location, + to report, and Chat for help.';
            case 'how-to-post':
                return 'Tap +, choose Camera or Gallery for an image, describe the issue, confirm location, then Submit.';
            case 'other':
                return 'You can describe your question. For urgent civic concerns, contact PMC helpline.';
            default:
                return 'Thanks! I\'ll improve over time. Try asking about posting or locations.';
        }
    };
    const getUserPrompt = (key) => {
        switch (key) {
            case 'report-something': return 'I want to report something';
            case 'where-is-issue': return 'Where is the issue picked from?';
            case 'how-to-use': return 'How do I use this app?';
            case 'how-to-post': return 'How to post a new issue?';
            case 'other': return 'I have another question.';
            default: return key;
        }
    };
    const inferKeyFromText = (text) => {
        const t = text.toLowerCase();
        if (t.includes('where') && t.includes('issue')) return 'where-is-issue';
        if (t.includes('how') && t.includes('use')) return 'how-to-use';
        if (t.includes('post')) return 'how-to-post';
        return 'other';
    };
    const renderBotBubble = (text) => `<div class="bubble bot">${text}</div>`;
    const renderUserBubble = (text) => `<div class="bubble user">${text}</div>`;

    function renderProfilePage() {
        const profileHTML = `
            <div class="profile-container">
                <h2>My Profile</h2>
                <div class="profile-section">
                    <h3>My Details</h3>
                    <p><strong>User Name:</strong> Divyanshu</p>
                    <p><strong>User ID:</strong> user12345</p>
                    <p><strong>Mobile Number:</strong> 9558747704</p>
                    <p><strong>Language:</strong> English</p>
                    <button>Edit Settings</button>
                </div>

                <div class="profile-section">
                    <h3>Issue Progress</h3>
                    <div class="progress-stats">
                        <div class="stat-item">
                            <div class="stat-number">2</div>
                            <div class="stat-label">In Progress</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">1</div>
                            <div class="stat-label">Under Review</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">3</div>
                            <div class="stat-label">Completed</div>
                        </div>
                    </div>
                </div>

                <div class="profile-section">
                    <h3>Posts in Process</h3>
                    <div id="posts-in-process">
                        <div class="issue-item">
                            <div class="issue-info">
                                <h4>Pothole on FC Road</h4>
                                <p>Status: Under Review by PMC</p>
                                <span class="issue-date">Reported: 2 days ago</span>
                            </div>
                            <div class="issue-status in-progress">In Progress</div>
                        </div>
                        <div class="issue-item">
                            <div class="issue-info">
                                <h4>Broken Streetlight</h4>
                                <p>Status: Work order issued</p>
                                <span class="issue-date">Reported: 1 week ago</span>
                            </div>
                            <div class="issue-status under-review">Under Review</div>
                        </div>
                    </div>
                </div>

                <div class="profile-section">
                    <h3>Resolved/Completed Issues</h3>
                    <div id="completed-issues">
                        <div class="issue-item">
                            <div class="issue-info">
                                <h4>Garbage Collection Issue</h4>
                                <p>Status: Resolved - Regular collection restored</p>
                                <span class="issue-date">Completed: 3 days ago</span>
                            </div>
                            <div class="issue-status completed">Completed</div>
                        </div>
                        <div class="issue-item">
                            <div class="issue-info">
                                <h4>Water Leakage</h4>
                                <p>Status: Fixed by water department</p>
                                <span class="issue-date">Completed: 1 week ago</span>
                            </div>
                            <div class="issue-status completed">Completed</div>
                        </div>
                        <div class="issue-item">
                            <div class="issue-info">
                                <h4>Lost Pet Found</h4>
                                <p>Status: Pet reunited with owner</p>
                                <span class="issue-date">Completed: 2 weeks ago</span>
                            </div>
                            <div class="issue-status completed">Completed</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        mainContent.innerHTML = profileHTML;
    }

    // Event listeners for the bottom navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            renderPage(page);
        });
    });

    // Initial page load
    renderPage('home');

    // Theme handling
    const THEME_KEY = 'issue-reporter-theme';
    const applyTheme = (mode) => {
        const root = document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(THEME_KEY, mode);
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            icon.className = mode === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    };
    const saved = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(saved);
    themeToggle?.addEventListener('click', () => {
        const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(next);
    });

    // Utils
    function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
});