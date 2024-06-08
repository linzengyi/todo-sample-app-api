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

## API 文件
文件網址
````
url: http://<主機名稱>:<PORT號>/docs
例: http://localhost:3000/docs
````