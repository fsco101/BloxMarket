-- USERS TABLE
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    roblox_username VARCHAR(50),
    avatar_url VARCHAR(255),
    credibility_score INT DEFAULT 0,
    role ENUM('user','mm','mw','admin','moderator') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TRADES TABLE
CREATE TABLE trades (
    trade_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_offered VARCHAR(255) NOT NULL,
    item_requested VARCHAR(255),
    description TEXT,
    status ENUM('open','in_progress','completed','cancelled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- WISHLISTS TABLE
CREATE TABLE wishlists (
    wishlist_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- VOUCHES TABLE
CREATE TABLE vouches (
    vouch_id INT PRIMARY KEY AUTO_INCREMENT,
    vouched_user_id INT NOT NULL,    -- the person being vouched
    given_by_user_id INT NOT NULL,   -- who gave the vouch
    rating INT CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vouched_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (given_by_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- FORUM POSTS
CREATE TABLE forum_posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category ENUM('trading_tips','scammer_reports','game_updates','general') DEFAULT 'general',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- FORUM COMMENTS
CREATE TABLE forum_comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- EVENTS & GIVEAWAYS
CREATE TABLE events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATETIME,
    end_date DATETIME,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- REPORTS (for scam/abuse)
CREATE TABLE reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    reported_user_id INT NOT NULL,
    reported_by_user_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending','reviewed','resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
-- TRADE IMAGES (multiple images per trade)
CREATE TABLE trade_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    trade_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE
);
