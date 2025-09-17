import {getCookie, setCookie, eraseCookie} from './main.js';
import {app, db, collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc} from './app.js';
// check if user is logged in
window.addEventListener('load', () => {
    const user = getCookie('userId');
    if(getCookie("emailToVirify")){
        window.location.href = './verify.html';
    }else if(user){
        window.location.href = '../../';
    }
});
// handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    // Simple email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(email)){
        alert('Please enter a valid email address.');
        return;
    }
    // Simulate sending a verification code to the email
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCookie('emailToVirify', email, 15); // 15 minutes
    // Check if user already exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email), limit(1));
    getDocs(q).then((querySnapshot) => {
        if (!querySnapshot.empty) {
            // User exists, update verification code
            const userDoc = querySnapshot.docs[0];
            updateDoc(doc(db, "users", userDoc.id), {
                verificationCode: verificationCode,
                createdAt: new Date(),
                isVerified: false,
            }).then(() => {
                sendVerificationEmail(email, verificationCode);
                setCookie('userId', userDoc.id, 60*24*365); // 1 Year
                alert(`تم ارسال رمز التحقق الي ${email}. الرمز صالح لمدة 15 دقائق`);
                window.location.href = './verify.html';
            });
        } else {
            // User does not exist, create new user
            addUser(email, verificationCode).then((docRef) => {
                sendVerificationEmail(email, verificationCode);
                setCookie('userId', docRef.id, 60*24*365); // 1 Year
                alert(`تم ارسال رمز التحقق الي ${email}. الرمز صالح لمدة 15 دقائق`);
                window.location.href = './verify.html';
            });
        }
    }).catch((error) => {
        console.error("Error checking user existence: ", error);
        alert('An error occurred. Please try again later.');
    });
});




function addUser(email,code) {
    return addDoc(collection(db, "users"), {
        email: email,
        createdAt: new Date(),
        verificationCode:code,
        isVerified: false,
    });
}

// Initialize EmailJS
function sendVerificationEmail(email, code) {
    const serviceID = 'service_82g1fut';
    const templateID = 'template_9yw7zah';
    const templateParams = {
        email: email,
        code: code,
        message: `${code} هو رمز التحقق الخاص بك لتسجيل الدخول إلى TeeNzy. هذا الرمز صالح لمدة 15 دقائق. إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`
    };

    emailjs.send(serviceID, templateID, templateParams)
        .then((response) => {
            console.log('SUCCESS!', response.status, response.text);
            alert('Verification email sent successfully!');
        }, (error) => {
            alert('Failed to send verification email. Please try again later.');
            console.log('FAILED...', error);
        });
}