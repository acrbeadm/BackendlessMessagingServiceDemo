# BackendlessMessagingServiceDemo ReadMe.md

## このデモプログラムについて

 Backendless.comおよび gmo-mbaas.com で利用可能な、Push通知機能のための送信専用コンソールです。
JavaScript SDKと Electron で開発しました。
標準の開発者コンソールでも、Push通知の送信はできますが、実際の運営を考慮して以下の点を工夫してみました。
 1. 過去の送信履歴を記録して再利用出来ます。
 2. Push送信のメッセージ本体を記載する際に、Json を意識する必要がありません。
 3. Windows Phone 向けのPush機能は外しています。
よろしければご活用下さい。

なお、Backendless, gmo-mBaas で Push通知を使ったアプリを開発される場合、標準では誰でもAPI経由で
Pushの送信が可能な状態になっています。送信は管理者だけが行うような場合は以下の手順でPush送信権限
を特定ユーザにだけ与えるようにACL(アクセスコントロールリスト)を設定しておくことをおすすめします。


 1. 「メッセージ」の画面に遷移
 2. 設定したいチャンネル名を左側のカラムでクリック
 3. 右上の赤いボタン「パーミッション」をクリック
 4. ユーザパーミッション、で送信権限を与えたいユーザを追加し、「HTTP Postを発行」にグリーンのチェックが入るようにクリック
 5. ロールパーミッションでは、アプリのユースケースに応じて、適切なユーザグループからの発行を禁止するように設定。
    例えば、４で指定したユーザ以外からのPushを禁止したい場合は全て✖が付くようにしておくことをおすすめします。

本アプリでは上のようにACL設定されている事を前提に、権限を持っているユーザのログインをしたうえで送信するような
運用にも対応しています。



## 起動方法

### Windows
 Explorer で
 `  .\BackendlessMessagingServiceDemo_vXX\electron-v0.33.7-win32-x64\ `
 を開き electron.exe をダブルクリックしてください

## 入力項目

### BaaS設定

#### ベースURL
 Backendless / gmo-mbaas への API リクエスト先を設定します。  
 http:// または https:// から記述してください。
 Backendless の場合は、 https://api.backendless.com を
 gmo-mBaaS の場合は、 https://api.gmo-mbaas.com を入力します。

#### Appliation ID
 対象となるアプリケーションの _Backendlessコンソール_ から _管理_ >  _アプリ設定_ で表示される、  _アプリケーションID:_ の値を設定します。

#### Secret key(JavaScript)
 対象となるアプリケーションの _Backendlessコンソール_ から _管理_ >  _アプリ設定_ で表示される、  _JavaSriptシークレットキー:_ の値を設定します。

#### Version
 対象となるアプリケーションの _Backendlessコンソール_ から _管理_ >  _バージョン管理_ で表示される、  _バージョン_ の値を設定します。

#### 送信ユーザ アカウント
 ログインするしたアプリ・ユーザのメールアドレスを設定します。

#### 送信ユーザ パスワード
 ログインするしたアプリ・ユーザのパスワードを設定します。

#### チャンネル
 使用したいチャンネル名を設定します。  
 既存のチャンネル名は対象となるアプリケーションの _Backendlessコンソール_ から _メッセージ_ で表示される _
 Pub/Subトラフィックモニター_ によって確認できます。

### Pushメッセージ送信

#### android-ticker-text
 Android GCM の tickerText を設定します。

#### android-content-title
 Android GCM の contentTitle を設定します。

#### android-content-text
 Android GCM の contentText を設定します。

#### iOS-Alert
 APNs のアラートメッセージを設定します。

#### 送信先OSを選ぶ
 送信先となる端末をOS単位で選択します。  
 _Android_ または _iOS_ にチェックを入れて下さい。  
 両方を対象としたい場合には、両方にチェックを入れて下さい。

#### その他の設定

##### iOS-Badge
 APNs のバッジナンバーを設定します。
 数字のみを入力してください。

##### iOS-Sound
 APNs のサウンド再生を設定します。

##### 送信方法
 _Push通知だけ送信_ は、Pushモデルによる送信を設定します。  
 _Push通知とメッセージを送信_ は、Pub/Subによる送信を設定します。

##### メッセージ送信用設定

###### Backendless PublisherID
 _Push通知とメッセージを送信_ で送信する PublisherID を設定します。

###### Backendless Subtopic
 _Push通知とメッセージを送信_ で送信する Subtopic を設定します。

###### Backendless Message
 _Push通知とメッセージを送信_ で送信するメッセージ本文を設定します。

###### 特定デバイス送信
 デバイスIDを設定します。  
 複数に送りたい場合は、複数のデバイスIDをカンマ区切りで入力してください。  
 デバイスIDは対象となるアプリケーションの _Backendlessコンソール_ から _メッセージ_ で表示される _
 Pub/Subトラフィックモニター_ の _デバイス_ タグで確認できます。
 入力しなかった場合、ブロードキャスト送信となります。

### 送信履歴
 送信した履歴が新しいもの順に表示されます。  
 送信履歴の行をクリックするとその送信時の設定がロードされます。

#### Android
 _送信先OSを選ぶ_ で _Android_ にチェックを入れていた場合、 _1_ になります。  
 チェックを入れていなかった場合、 _0_ になります。

#### iOS
 _送信先OSを選ぶ_ で _iOS_ にチェックを入れていた場合、 _1_ になります。  
 チェックを入れていなかった場合、 _0_ になります。

#### 送信方法
 _送信方法_ で選択した、 _Push通知だけ送信_ または _Push通知とメッセージを送信_ が表示されます。

#### 送信先
 _ブロードキャスト送信_ または、 デバイスIDが表示されます。

#### message header text
 Backendless SDK Messaging Service API の PublishOptions.header 属性で設定されたプロパティが表示されます。  
 詳しくは、 [Backendless SDK Documentation - Messaging Service API Core - Classes](http://backendless.com/documentation/messaging/js/messaging_core_classes.htm) を参照下さい。

#### 送信日時
 年月日時分秒で送信日時が表示されます。

#### 送信結果
 送信結果が表示されます。

## 設定ファイル

### Windows
 ` .\BackendlessMessagingServiceDemo_vXX\electron-v0.33.7-win32-x64\ ` 以下に、

* history.json
* input_data.json

 の2つのファイルが作成されます。  
 どちらにもパスワードなどが含まれますので、取り扱いにご注意ください。


## 本アプリについて。
本アプリはApache License 2.0（http://www.apache.org/licenses/LICENSE-2.0.html） に基づいて再利用が可能です。
 本ソフトウェアは無保証です。自己責任で使用してください。
