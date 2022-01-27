# attendance_app
AWSで作ってみた勤怠管理アプリ

## アーキテクチャ
- AWSを使ったサーバーレスWebアプリ
- 簡単にしたいのでAPI Gatewayとlambdaを使用
![image](readme/aws_architecture_image.png)

- 構成図作成サイト：https://app.diagrams.net/

## 要件
- 打刻
  - マイページの打刻ページから
  - 休憩はとりあえずなしで、出勤と退勤のみ
- 承認申請、修正申請
  - 上司に申請を要求、部下の申請を承認/修正要請
- グルーピング
  - グループの中で承認する/されるユーザーを定義する
<img src="readme/group_image.png" width="50%">

## 画面デザイン
<img src="readme/design1.png" width="50%"><img src="readme/design2.png" width="50%">
<img src="readme/design3.png" width="50%"><img src="readme/design4.png" width="50%">

## モデル設計
dynamoDBのベストプラクティスは難しいから、RDB的な設計にする<br>
データ数が少ないのでN+1問題は無視

![sequence dialog](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/AtsushiNi/attendance_app/main/readme/ER_image.txt)

### Attendanceモデルのstatus
![sequence dialog](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/AtsushiNi/attendance_app/main/readme/attendance_statuses.txt)

## 使用したReactライブラリ
- サイドバー：[react-pro-sidebar](https://github.com/azouaoui-med/react-pro-sidebar)
- ヘッダー：[material-ui AppBar](https://mui.com/components/app-bar/)
- ルーティング：[react-router-dom](https://v5.reactrouter.com/web/guides/quick-start)
