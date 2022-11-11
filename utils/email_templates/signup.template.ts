export default function (name:string,verificationLink:string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body{
            margin: 0;
            padding: 0;
            background-color: #c3c3c3;
            display: flex;
            height: 100vh;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif
        }
        .card{
            border-radius: 10px;
            background-color: #f0f0f0;
            width: 500px;
            margin: auto;
            overflow: hidden;
        }
        h1,h2,h3,h4,h5,h6{
            margin: 0;
        }
        .blue {
            background-color: rgb(98, 147, 216);
            text-align: center;
            padding: 20px;
            color: white;
        }
        .seco{
            height: auto;
            padding-bottom: 20px;
            text-align: center;
        }
        .seco p.name{
            text-align: left;
            padding: 5px 20px;
            margin: 0px;
        }
        .seco > p{
            color: rgb(77, 73, 73);
            text-align: left;
            font-size: smaller;
            padding: 5px 20px;
            margin: 0px 0 20px 0px;
        }
        .seco > a{
            text-align: center;
            text-decoration: none;
            color: white;
            background-color: rgb(13, 194, 109);
            padding: 10px;
            margin: 20px;
            border-radius: 50px;
            position: relative;
        }
    </style>
    <title>Syplans</title>
</head>
<body>
    <div class="card" >
        <div class="blue">
            <h3 >Syplans</h3>
        </div>
        <div class="seco">
            <p class="name">Hi <strong>${name}</strong>,</p>
            <p>Thank you for choosing <b>SyPlans</b>, Please continue by clicking</p>
            <a href="${verificationLink}">
               Verify Account
            </a>
        </div>
    </div>
    
</body>
</html>`
}