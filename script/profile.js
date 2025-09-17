import {getCookie, setCookie, eraseCookie} from 'https://khalidwalidanwar.github.io/TeeNzy/script/main.js';
import {app, db, collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc} from 'https://khalidwalidanwar.github.io/TeeNzy/script/app.js';

const menu =document.querySelector("header .links .menu")
const overlay =document.querySelector(".mainOverlay");
const info =document.querySelector("header .info");

const prompt =document.querySelector(".prompt");

const fName = document.querySelector(".fName");
const lName = document.querySelector(".lName");
const email = document.querySelector(".email");
const userId = getCookie('userId');
const locationInput = document.querySelector(".prompt .location")
const phoneInput = document.querySelector(".prompt .phone")
const cityInput = document.querySelector(".prompt .city")
const countryInput = document.querySelector(".prompt .country")
//load-Username data
window.addEventListener("load", async()=>{
    if(userId){
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            fName.placeholder = userData.firstName || 'Firstname';
            lName.placeholder = userData.lastName || 'Lastname';
            email.placeholder = userData.email || '';
            // Load addresses
            const addressList = document.querySelector(".address-list");
            addressList.innerHTML = '';
            if(userData.addresses && Object.values(userData.addresses).length > 0){
                var addresseslist = userData.addresses;
                Object.values(addresseslist).forEach((item, index) => {
                    const addressItem = document.createElement("div");
                    addressItem.classList.add("address-item");
                    addressItem.setAttribute("data-index",index)
                    addressItem.innerHTML = `
                        <p>${item.address}</p>
                        <div class="address-actions">
                            <button class="edit-address btn btn-secondary">Edit</button>
                            <button class="delete-address btn btn-danger">Delete</button>
                        </div>
                    `;
                    // Edit address
                    addressItem.querySelector(".edit-address").addEventListener("click", (e) => {
                        var thisAddress = Object.values(userData.addresses)[e.target.closest(".address-item").getAttribute("data-index")];
                        phoneInput.value =thisAddress.phone;
                        locationInput.value = thisAddress.address;
                        cityInput.value = thisAddress.city;
                        countryInput.value = thisAddress.country;
                        prompt.style.top = '50%';
                        overlay.style.display = 'block';
                        prompt.setAttribute("data-index",e.target.closest(".address-item").getAttribute("data-index"));
                    });
                    // Delete address
                    addressItem.querySelector(".delete-address").addEventListener("click", (e) => {
                        if (confirm("Are you sure you want to delete this address?")) {
                            e.target.setAttribute("disabled", "");
                            var zAddresses = userData.addresses;
                            delete zAddresses[e.target.closest(".address-item").getAttribute("data-index")]
                            zAddresses = Object.values(zAddresses).reduce((acc, item, index) => {
                                acc[index] = item;
                                return acc;
                            }, {});
                            updateDoc(userRef, { addresses: zAddresses }).then(() => {
                                addressItem.remove();
                                if(userData.addresses.length === 0){
                                    addressList.innerHTML = '<p>No addresses yet.</p>';
                                }
                            });
                        }
                    });
                    addressList.appendChild(addressItem);
                });
            }else{
                addressList.innerHTML = '<p>No addresses yet.</p>';
            }
            if(userData.orders && userData.orders.length > 0){
                document.querySelector(".orders .noOrders").style.display='none';
                // Load orders here
                var orderslist = userData.orders;
                const orderListContainer = document.querySelector(".orders .order-list");
                orderslist.forEach(async(zorder) => {
                    const orderRef = doc(db, "orders", zorder);
                    const orderSnap = await getDoc(orderRef);
                    const orderData = orderSnap.data();
                    const order = orderData;
                    // Create order item
                    const orderItem = document.createElement("div");
                    orderItem.classList.add("order-item");
                    orderItem.innerHTML = `
                        <div class="orderDetails">
                            <p class="order-id">Order ID: ${order.orderId}</p>
                            <p class="order-date">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                            <p class="order-status">Status: ${order.status}</p>
                            <p class="order-total">Total: ج.م ${order.totalPrice}</p>
                        </div>
                        <button class="view-details btn btn-info">View Details</button>
                    `;
                    orderItem.querySelector(".view-details").addEventListener("click", async() => {
                        const orderPreview = document.querySelector(".orderPreview");
                        const orderDetailsContent = document.querySelector(".orderPreview .orderDetailsContent");
                        orderDetailsContent.innerHTML = '';
                        Object.values(order.products).forEach(item => {
                            getDoc(doc(db, "products", item.productId)).then((productSnap) => {
                                if (productSnap.exists()) {
                                    const productData = productSnap.data();
                                    const itemDiv = document.createElement("div");
                                    itemDiv.classList.add("order-item-detail");
                                    itemDiv.innerHTML = `
                                        <p><strong>Product:</strong> ${productData.title}</p>
                                        <p><strong>Quantity:</strong> ${item.quantity}</p>
                                        <p><strong>Size:</strong> ${item.size}</p>
                                        <p><strong>Price:</strong> ج.م ${productData.newPrice}</p>
                                        <p><strong>total:</strong> ج.م ${productData.newPrice * item.quantity}</p>
                                        
                                    `;
                                    orderDetailsContent.appendChild(itemDiv);
                                    if(Object.values(order.products).indexOf(item) === Object.values(order.products).length - 1) {
                                        // order location
                                        const locationDiv = document.createElement("div");
                                        locationDiv.classList.add("order-location-detail");
                                        locationDiv.innerHTML = `
                                            <h4>عنوان التوصيل:</h4>
                                            <p>${order.address.address}, ${order.address.city}, ${order.address.country}</p>
                                            <p>رقم الهاتف: ${order.address.phone}</p>
                                            
                                        `;
                                        orderDetailsContent.appendChild(locationDiv);
                                        // total products price
                                        const productsTotalDiv = document.createElement("div");
                                        productsTotalDiv.classList.add("order-products-total");
                                        productsTotalDiv.innerHTML = `
                                            <h4>اجمالي المنتجات: ج.م ${order.totalOfProducts}</h4>
                                        `;
                                        orderDetailsContent.appendChild(productsTotalDiv);
                                        // shipping and discount info
                                        const shippingDiv = document.createElement("div");
                                        shippingDiv.classList.add("order-shipping-detail");
                                        shippingDiv.innerHTML = `
                                            <h4>التوصيل: ج.م ${order.deliveryFees}</h4>
                                            ${order.couponCode ? `<h4>الخصم: - ج.م ${order.discount}</h4>` : ''}
                                        `;
                                        orderDetailsContent.appendChild(shippingDiv);
                                        // total price
                                        const totalDiv = document.createElement("div");
                                        totalDiv.classList.add("order-total-detail");
                                        totalDiv.innerHTML = `
                                            <h4>الاجمالي: ج.م ${order.totalPrice}</h4>
                                        `;
                                        orderDetailsContent.appendChild(totalDiv);
                                        // canceling order if order status is pending
                                        if(order.status === 'pending') {
                                            const cancelBtn = document.createElement("button");
                                            cancelBtn.classList.add("btn", "btn-danger", "cancel-order");
                                            cancelBtn.textContent = "Cancel Order";
                                            cancelBtn.addEventListener("click", (e) => {
                                                e.target.setAttribute("disabled", "");
                                                if(confirm("Are you sure you want to cancel this order?")) {
                                                    updateDoc(doc(db, "orders", orderSnap.id), {
                                                        status: 'Cancelled'
                                                    }).then(() => {
                                                        alert("Order cancelled successfully.");
                                                        window.location.reload();
                                                    });
                                                }
                                            });
                                            orderDetailsContent.appendChild(cancelBtn);
                                        }else if(order.status === 'Cancelled'){
                                            const cancelInfo = document.createElement("p");
                                            cancelInfo.style.color = 'red';
                                            cancelInfo.style.fontWeight = 'bold';
                                            cancelInfo.textContent = "تم الغاء الاوردر";
                                            orderDetailsContent.appendChild(cancelInfo);
                                        }else{
                                            const cancelInfo = document.createElement("p");
                                            cancelInfo.style.color = 'red';
                                            cancelInfo.style.fontWeight = 'bold';
                                            cancelInfo.textContent = "الاوردر في طريقه اليك";
                                            orderDetailsContent.appendChild(cancelInfo);
                                        }
                                        orderPreview.style.display = 'flex';
                                    }
                                } else {
                                    item.title = "Unknown Product";
                                }
                            })
                        })
                        
                        document.querySelector(".orderPreview .controle").addEventListener("click",()=>{
                            orderPreview.style.display = 'none';
                        });
                        document.querySelector(".orderPreview").addEventListener("click",()=>{
                            orderPreview.style.display = 'none';
                        });
                    });
                    orderListContainer.appendChild(orderItem);
                });
            }else{
                document.querySelector(".orders .noOrders").style.display='block';
            }
        } else {
            alert("No such document!");
            window.location.href = 'https://khalidwalidanwar.github.io/TeeNzy/components/login/';
        }
    }else{
        window.location.href = 'https://khalidwalidanwar.github.io/TeeNzy/components/login/';
    }
})

// Save profile changes
document.querySelector(".info .edit-profile").addEventListener("click",async()=>{
    if(fName.value!='' || lName.value!=''){
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            updateDoc(doc(db, "users", userId), {
                firstName: fName.value,
                lastName: lName.value,
            }).then(() => {
                alert("!تم تحديث البيانات بنجاح");
                window.location.reload();
            });
        }else {
            alert("No such document!");
            window.location.href = 'https://khalidwalidanwar.github.io/TeeNzy/components/login/';
        }
    }else{
        window.location.reload();
    }
})

document.querySelector(".info .add-address").addEventListener("click",()=>{
    prompt.style.top = '50%';
    overlay.style.display='block';
})
document.querySelector(".prompt .submit").addEventListener("click",async(e)=>{
    if(locationInput.value == "" || phoneInput.value =="" || cityInput.value == "" || countryInput.value == ""){
        alert("من فضلك املئ البيانات كاملة !");
    }else{
        var patternPh = /^01[0-2,5][0-9]{8}$/;
        if(patternPh.test(phoneInput.value)){
            e.target.setAttribute("disabled", "");
            const newAddress = locationInput.value;
            const addressCity = cityInput.value;
            const addressPhone = phoneInput.value;
            const addressCountry = countryInput.value;
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (!prompt.getAttribute("data-index")) {
                    const found = Object.values(userData.addresses).find(item => item.phone == phoneInput.value);
                    if(found){
                        e.target.removeAttribute("disabled");
                        alert("رقم الهاتف هذا مسجل سابقا!");
                        return;
                    }else{
                        if(userData.addresses && Object.values(userData.addresses).length > 0){
                            var theAddresses = userData.addresses;
                            var theFullAddress = {address:newAddress,city:addressCity,phone:addressPhone,country:addressCountry};
                            theAddresses[Object.values(theAddresses).length] = theFullAddress;
                            updateDoc(doc(db, "users", userId), {
                            addresses: theAddresses,
                            }).then(() => {
                                const addressItem = document.createElement("div");
                                addressItem.classList.add("address-item");
                                addressItem.innerHTML = `
                                    <p>${newAddress}</p>
                                    <div class="address-actions">
                                        <button class="edit-address btn btn-secondary">Edit</button>
                                        <button class="delete-address btn btn-danger">Delete</button>
                                    </div>
                                `;
                                document.querySelector(".address-list").appendChild(addressItem);
                                alert("!تم تحديث البيانات بنجاح");
                                window.location.reload();
                            });
                        }else{
                            updateDoc(doc(db, "users", userId), {
                            addresses: {0:{address:newAddress,city:addressCity,phone:addressPhone,country:addressCountry}},
                            }).then(() => {
                                document.querySelector(".address-list").innerHTML = '';
                                const addressItem = document.createElement("div");
                                addressItem.classList.add("address-item");
                                addressItem.innerHTML = `
                                    <p>${newAddress}</p>
                                    <div class="address-actions">
                                        <button class="edit-address btn btn-secondary">Edit</button>
                                        <button class="delete-address btn btn-danger">Delete</button>
                                    </div>
                                `;
                                document.querySelector(".address-list").appendChild(addressItem);
                                closePrompt();
                                alert("!تم تحديث البيانات بنجاح");
                                window.location.reload();
                            });
                        }
                    }
                }else{
                    var zAddresses = userData.addresses;
                    zAddresses[[prompt.getAttribute("data-index")]].address = locationInput.value;
                    zAddresses[[prompt.getAttribute("data-index")]].phone = phoneInput.value;
                    zAddresses[[prompt.getAttribute("data-index")]].city = cityInput.value;
                    zAddresses[[prompt.getAttribute("data-index")]].country = countryInput.value;
                    updateDoc(doc(db, "users", userId), {
                    addresses: zAddresses,
                    }).then(() => {
                        alert("تم تحديث البيانات");
                        window.location.reload();
                    })
                }
            }
        }else{
            alert("ادخل رقم هاتف مصري صالح")
        }
    }
})

{ // header menu
// menu toggle
document.querySelector("header .links .menuBar").addEventListener("click",()=>{
    menu.style.left =0;
    info.style.left = '85px'
    overlay.style.display = 'block';
})
document.querySelector("header .links .menu .controle").addEventListener("click",()=>{
    menu.style.left ="-100%";
    info.style.left = '-100%'
    overlay.style.display = 'none';
})
menu.querySelectorAll("ul li").forEach(link=>{
    link.addEventListener("click",()=>{
        menu.style.left ="-100%";
        info.style.left = '-100%'
        overlay.style.display = 'none';
    })
})
overlay.addEventListener("click",()=>{
    menu.style.left ="-100%";
    info.style.left = '-100%'
    overlay.style.display = 'none';
    closePrompt();
})
document.querySelector("header .info .cart").addEventListener("click",()=>{
    if(getCookie('userId')){
        if(window.localStorage.cart && Object.values(JSON.parse(window.localStorage.cart)).length > 0){
            window.location.href = 'https://khalidwalidanwar.github.io/TeeNzy/components/orderConfirmation/cart.html';
        }else{
            alert("! يرجي اضافة منتجات الي العربة ")
            window.location.href = 'https://khalidwalidanwar.github.io/TeeNzy/components/catalog/';
        }
    }else{
        alert('يرجى تسجيل الدخول أولاً للوصول إلى سلة التسوق.');
        window.location.href = 'https://khalidwalidanwar.github.io/TeeNzy/components/login/';
    }
});
}

// Logout
document.querySelector(".logout").addEventListener("click", function() {
    // Clear user session (this is just a placeholder, implement actual logout logic)
    window.localStorage.removeItem('favoriteProducts');
    window.localStorage.removeItem('cart');
    document.cookie = "userId" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "isVerified" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    updateDoc(doc(db, "users", userId), {
        isVerified: false
    });
    alert("You have been logged out.");
    window.location.href = "https://khalidwalidanwar.github.io/TeeNzy";
});

function closePrompt() {
    prompt.style.top='-100%';
    phoneInput.value ='';
    locationInput.value ='';
    cityInput.value ='';
    countryInput.value ='';
    overlay.style.display ='none';
    prompt.removeAttribute("data-index")

}
