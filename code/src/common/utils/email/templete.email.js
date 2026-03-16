export const emailTemplete = ({code,title}={})=>{
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
body{
    margin:0;
    padding:0;
    background:#88BDBF;
    font-family: Arial, Helvetica, sans-serif;
}

.container{
    max-width:600px;
    width:90%;
    margin:auto;
    background:#F3F3F3;
    border:1px solid #630E2B;
}

.header{
    padding:20px;
}

.logo{
    width:90px;
}

.view-link{
    text-decoration:none;
    color:#630E2B;
    font-size:14px;
}

.main{
    background:#ffffff;
    text-align:center;
}

.icon-box{
    background:#630E2B;
    height:90px;
}

.icon-box img{
    margin-top:20px;
}

.title{
    color:#630E2B;
    margin-top:25px;
}

.message{
    padding:0 30px;
    color:#444;
    line-height:1.6;
}

.code{
    display:inline-block;
    margin:20px 0 30px;
    padding:12px 25px;
    background:#630E2B;
    color:#fff;
    border-radius:4px;
    font-size:18px;
}

.footer{
    text-align:center;
    padding:20px;
}

.social img{
    width:40px;
    margin:5px;
}

/* Responsive */

@media(max-width:600px){

.message{
padding:0 15px;
}

.title{
font-size:22px;
}

.code{
font-size:16px;
padding:10px 20px;
}

}
</style>

</head>

<body>

<table class="container" cellpadding="0" cellspacing="0">

<tr>
<td class="header">

<table width="100%">
<tr>

<td>
<img class="logo"
src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png">
</td>

<td style="text-align:right">
<a class="view-link" href="http://localhost:4200/#/">View In Website</a>
</td>

</tr>
</table>

</td>
</tr>


<tr>
<td class="main">

<div class="icon-box">
<img width="50"
src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
</div>

<h1 class="title">${title}</h1>

<p class="message">
Your verification code is below.
Use this code to continue your process.
</p>

<div class="code">
${code}
</div>

</td>
</tr>


<tr>
<td class="footer">

<h3>Stay in touch</h3>

<div class="social">

<img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png">

<img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png">

<img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png">

</div>

</td>
</tr>

</table>

</body>
</html>`
}