# Neo's Unified Page

**[Neo's Unified Page](https://neos21.pages.dev/)**


## Cloudflare 管理画面での作業

- Pages : GitHub リポジトリとの連携開始
    - URL 定義
    - 環境変数の設定
- D1 : データベース作成
    - テーブル作成


## ローカル開発

- ローカルサーバからリモートの D1 データベースへは接続できないため、ローカルの DB に自分でテーブルを作る必要がある
    - `$ npm run wrangler d1 execute neos21 -- --local --command='CREATE TABLE IF NOT EXISTS pages (url PRIMARY KEY, title TEXT, markdown TEXT)'`
    - `$ npm run wrangler d1 execute neos21 -- --local --command='INSERT INTO pages (url, title, markdown) VALUES ("example", "Example", "# Example")'`


## Links

- [Neo's World](https://neos21.net/)
