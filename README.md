# attendance_app
AWSで作ってみた勤怠管理アプリ

## アーキテクチャ
- AWSを使ったサーバーレスWebアプリ
- 簡単にしたいのでAPI Gatewayとlambdaを使用
![image](aws_architecture_image.png)

- 構成図作成サイト：https://app.diagrams.net/

## 要件
- 打刻
  - マイページの打刻ページから
  - 休憩はとりあえずなしで、出勤と退勤のみ
- 承認申請、修正申請
  - 上司に申請を要求、部下の申請を承認/修正要請
- グルーピング
  - グループの中で承認する/されるユーザーを定義する
<img src="group_image.png" width="50%">

## 画面デザイン
<img srrc="design.pdf" width="50%">
