<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title></title>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    </head>
    <body style="padding: 10px; background-color: #e6e6e6;">
        <table style="width: 100%; margin: 0; padding: 0;" border="0">
            <tr>
                <td style="background-color: #ffffff; border-bottom: 1px solid #e6e6e6; padding: 20px 10px;">
                    <span style="color: #333; font-size: 25px;">KISAN</span>
                </td>
            </tr>
            <tr>
                <td style="background-color: #ffffff; border-bottom: 1px solid #e6e6e6; padding: 20px 10px; font-size: 17px;">
                    Hello {{ $user->name }},<br/><br/>
                    You have requested a new password for your account for {{ $model->email }}. No changes have been made to your account yet.

You can reset your password by clicking the button below:<br/><br/>
                    <a href="{{$reset_link}}" style="border: 1px solid #e6e6e6; padding: 10px 10px; background-color: #0275d8; color: #ffffff; text-decoration: none; cursor: pointer;">Recover Account</a><br/><br/>
                    Thanks!
                </td>
            </tr>
            <tr>
                <td style="background-color: #ffffff; border-bottom: 1px solid #e6e6e6; padding: 20px 10px; text-align: center;">
                    <span style="font-size: 15px;">Copyright &copy; 2025</span>
                </td>
            </tr>
        </table>
    </body>
</html>
