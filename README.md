# todo-sample-app-api
專案todo-sample-app呼叫用API

## 專案運行說明
1.於專案根目錄下新增.env檔，新增以下參數:
````
    #server
    PORT=<自訂PORT號>

    #database
    DATABASE_HOST=postgresql_db
    DATABASE_PORT=5432
    DATABASE_USER=<帳號>
    DATABASE_PASSWORD=<密碼>
    DATABASE_NAME=<資料庫名稱>

    #authenticate
    ACCESS_TOKEN_SECRET=<自訂access_token-key>
    REFRESH_TOKEN_SECRET=<自訂refresh-token-key>

    #password hash
    PASSWORD_HASH_KEY=<自訂hash key>
````
2.執行命令
````
    docker-compose up
````

3.新建資料表
`````` SQL
CREATE TABLE users (
	id SERIAL NOT NULL PRIMARY KEY,
	account VARCHAR(50) NOT NULL UNIQUE,
	password VARCHAR(200) NOT NULL, 
	name VARCHAR(10) NOT NULL,
	created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE tokens (
	state VARCHAR(1) DEFAULT NULL,
	access_token VARCHAR(200) UNIQUE NOT NULL, 
	refresh_token VARCHAR(200) NOT NULL, 
	user_id INTEGER NOT NULL, 
	created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- 建立索引
CREATE INDEX idx_userId_accessToken ON tokens (user_id, access_token);
CREATE INDEX idx_userId_refreshToken ON tokens (user_id, refresh_token);


CREATE TABLE todos (
	id SERIAL NOT NULL PRIMARY KEY,
	title VARCHAR(100) NOT NULL,
	is_completed BOOLEAN NOT NULL DEFAULT false,
	is_delete BOOLEAN NOT NULL DEFAULT false,
	user_id INTEGER NOT NULL REFERENCES users(id),
	created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
``````


## API 文件
文件網址
````
url: http://<主機名稱>:<PORT號>/docs
例: http://localhost:3000/docs
````