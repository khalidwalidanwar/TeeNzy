import {getCookie, setCookie, eraseCookie,appendAlert,getUserData,getProductData,getOrderData,updateOrder,updateProduct,updateUser} from './main.js';
// import {app, db, collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc} from './app.js';

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
        getUserData(userId).then((userData)=>{
            fName.placeholder = userData.firstName || 'Firstname';
            lName.placeholder = userData.lastName || 'Lastname';
            email.placeholder = userData.email || '';
            document.querySelector(".main .info .loading").remove();
            document.querySelector(".main .info .user-details").classList.remove("d-none");
            document.querySelector(".main .info .addresses").classList.remove("d-none");
            // Load addresses
            const addressList = document.querySelector(".address-list");
            addressList.innerHTML = '';
            if(userData.addresses && userData.addresses != "Array" && Object.values(userData.addresses).length > 0){
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
                            updateUser(userId,{addresses: zAddresses}).then(() => {
                                addressItem.remove();
                                if(userData.addresses.length == 0){
                                    addressList.innerHTML = '<p>No addresses yet.</p>';
                                }
                            });
                        }
                    });
                    addressList.prepend(addressItem);
                });
            }else{
                addressList.innerHTML = '<p>No addresses yet.</p>';
            }
            if(userData.orders && userData.orders.length > 0){
                document.querySelector(".orders .noOrders").style.display='none';
                // Load orders here
                var orderslist = userData.orders;
                orderslist.length >= 10 ? document.querySelector(".container.main .orders .order-list").style.overflowY = 'scroll' : document.querySelector(".container.main .orders .order-list").style.overflowY = 'visible';
                const orderListContainer = document.querySelector(".orders .order-list");
                orderslist.forEach(async(zorder) => {
                    getOrderData(zorder).then((order)=>{
                        // Create order item
                        const orderItem = document.createElement("div");
                        orderItem.classList.add("order-item");
                        orderItem.innerHTML = `
                            <div class="orderDetails">
                                <p class="order-id">Order ID: ${order.orderId}</p>
                                <p class="order-date">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                                <p class="order-status ">Status: <span class='${order.status}'>${order.status}</span></p>
                                <p class="order-total">Total: ${order.totalPrice} EGP</p>
                            </div>
                            <button class="view-details btn btn-info">View Details</button>
                        `;
                        orderItem.querySelector(".view-details").addEventListener("click", async(e) => {
                            e.target.setAttribute("disabled","");
                            const orderPreview = document.querySelector(".orderPreview");
                            const orderDetailsContent = document.querySelector(".orderPreview .orderDetailsContent");
                            orderDetailsContent.innerHTML = '';
                            // order location
                            const locationDiv = document.createElement("div");
                            locationDiv.classList.add("order-location-detail");
                            locationDiv.innerHTML = `
                            <h4>Shipping information:-</h4>
                            <p>Address: ${order.address.address}, ${order.address.city}, ${order.address.country}</p>
                            <p>Phone: ${order.address.phone}</p>
                            `;
                            orderDetailsContent.appendChild(locationDiv);
                            orderDetailsContent.innerHTML += '<div class="order-items"></div>';
                            const orderItems = document.querySelector(".orderPreview .orderDetailsContent .order-items");
                            // order items
                            Object.values(order.products).forEach(async (item) => {
                                if(item.productId == "custom-tshirt"){
                                    // Customized product
                                    var highQualitFees;
                                    var lowQualityFees;
                                    var printingFees;
                                    // get product price from firebase based on TShirtDetails
                                    getProductData("customized-product").then((doc)=>{
                                        const productData = doc;
                                        highQualitFees = productData.high;
                                        lowQualityFees = productData.low;
                                        printingFees = productData.printing;
                                        // calc. price
                                        let price = 0;
                                        item.material == "High" ? price += highQualitFees : price += lowQualityFees;
                                        item.printingBackImg && item.printingFrontImg ? price += parseInt(printingFees)*2 :
                                        item.printingImg || item.printingBackImg || item.printingFrontImg ? price += printingFees : price+= parseInt(printingFees);
                                        item.sizeType=="oversize"?price+=50:"";
                                        const productTotalPrice = price * item.quantity;
                                        const itemDiv = document.createElement("div");
                                        itemDiv.classList.add("order-item-detail");
                                        itemDiv.classList.add("card");
                                        itemDiv.innerHTML = `
                                        <img src="../../sources/customTshirt.png" class='card-img-top' alt="Custom T-shirt" width="100">
                                        <div class="card-body item-info">
                                        <h5 class='card-title'>Custom T.</h5>
                                        <p>{ ${item.size} (${item.sizeType}) , ${item.color} ${item.style} }</p>
                                        <p>Quantity: ${item.quantity}</p>
                                        <p class='last'>Price: ${price} EGP</p>
                                        <p class='totalPrice'><strong>Total</strong>: ${productTotalPrice} EGP</p>
                                        </div>
                                        `;
                                        orderItems.appendChild(itemDiv);
                                    });
                                }
                                getProductData(item.productId).then(async(product) => {
                                    if (product) {
                                        const productData = product;
                                        const itemDiv = document.createElement("div");
                                        itemDiv.classList.add("order-item-detail");
                                        itemDiv.classList.add("card");
                                        const finalPrice = item.sizeType=="oversize"?parseInt(productData.newPrice+50):productData.newPrice;
                                        itemDiv.innerHTML = `
                                            <img src="${productData.imgUrl[0]}" class='card-img-top' style='max-width: 70px;margin: auto;' alt="${productData.title}" width="100">
                                            <div class="card-body item-info">
                                                <h5 class='card-title'>${productData.title}</h5>
                                                <p>Quantity: ${item.quantity}</p>
                                                <p>Size: ${item.size} (${item.sizeType})</p>
                                                <p class='last'>Price: ${finalPrice} EGP</p>
                                                <p>.....</p>
                                                <p class='totalPrice'><strong>Total</strong>: ${finalPrice * item.quantity} EGP</p>
                                            </div>
                                        `;
                                        orderItems.appendChild(itemDiv);
                                    } else {
                                        console.error("No such product document!");
                                    }
                                    if(Object.values(order.products).indexOf(item) === Object.values(order.products).length - 1) {
                                        // total products price
                                        const productsTotalDiv = document.createElement("div");
                                        productsTotalDiv.classList.add("order-products-total");
                                        productsTotalDiv.innerHTML = `
                                            <h4>Total products: ${order.totalOfProducts} EGP</h4><hr>
                                        `;
                                        orderDetailsContent.appendChild(productsTotalDiv);
                                        // shipping and discount info
                                        const shippingDiv = document.createElement("div");
                                        shippingDiv.classList.add("order-shipping-detail");
                                        shippingDiv.innerHTML = `
                                            <h4>Shipping: ${order.deliveryFees} EGP</h4>
                                            ${order.discount ? `<h4>Discount: -${order.discount} EGP</h4>` : ''}
                                        `;
                                        orderDetailsContent.appendChild(shippingDiv);
                                        // total price
                                        const totalDiv = document.createElement("div");
                                        totalDiv.classList.add("order-total-detail");
                                        totalDiv.innerHTML = `
                                            <hr><h4>Total: ${order.totalPrice} EGP</h4>
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
                                                    updateOrder(order.id,{
                                                        status: 'cancelled'
                                                    }).then(() => {
                                                        appendAlert("Order cancelled successfully.","success");
                                                        setTimeout(() => {
                                                            window.location.reload();
                                                        }, 3000);
                                                    });
                                                }
                                            });
                                            orderDetailsContent.appendChild(cancelBtn);
                                        }else if(order.status === 'cancelled'){
                                            const cancelInfo = document.createElement("p");
                                            cancelInfo.style.color = 'red';
                                            cancelInfo.style.fontWeight = 'bold';
                                            cancelInfo.textContent = "Order has been cancelled";
                                            orderDetailsContent.appendChild(cancelInfo);
                                        }else if(order.status === 'delivered'){
                                            const cancelInfo = document.createElement("p");
                                            cancelInfo.style.color = 'green';
                                            cancelInfo.style.fontWeight = 'bold';
                                            cancelInfo.textContent = "Delivered";
                                            orderDetailsContent.appendChild(cancelInfo);
                                        }else if(order.status === 'delivering'){
                                            const cancelInfo = document.createElement("p");
                                            cancelInfo.style.color = 'yellowgreen';
                                            cancelInfo.style.fontWeight = 'bold';
                                            cancelInfo.textContent = "Delivering";
                                            orderDetailsContent.appendChild(cancelInfo);
                                        }else if(order.status === 'preparing'){
                                            const cancelInfo = document.createElement("p");
                                            cancelInfo.style.color = 'darkgreen';
                                            cancelInfo.style.fontWeight = 'bold';
                                            cancelInfo.textContent = "Your order is being prepared.....";
                                            orderDetailsContent.appendChild(cancelInfo);
                                        }
                                        orderPreview.style.display = 'flex';
                                        e.target.removeAttribute("disabled");
                                    }
                                    orderPreview.style.display = 'flex';
                                    e.target.removeAttribute("disabled");
                                })
                            });
                            
                            document.querySelector(".orderPreview .controle").addEventListener("click",(e)=>{
                                orderPreview.style.display = 'none';
                            });
                            document.querySelector(".orderPreview").addEventListener("click",(e)=>{
                                e.target.classList.contains("orderPreview")?orderPreview.style.display = 'none':"";
                            });
                        });
                        orderListContainer.prepend(orderItem);
                    })
                });
            }else{
                document.querySelector(".orders .noOrders").style.display='block';
            }
        })
    }else{
        window.location.href = '../login/';
    }
})

// Save profile changes
document.querySelector(".info .edit-profile").addEventListener("click",async(e)=>{
    e.target.setAttribute("disabled","")
    if(fName.value!='' || lName.value!=''){
        updateUser(userId,{
            firstName: fName.value,
            lastName: lName.value,
        }).then(() => {
            appendAlert("Account info updated successfully!","success");
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        });
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
        appendAlert("Please fill all fields first !","warning");
    }else{
        var patternPh = /^01[0-2,5][0-9]{8}$/;
        if(patternPh.test(phoneInput.value)){
            e.target.setAttribute("disabled", "");
            const newAddress = locationInput.value;
            const addressCity = cityInput.value;
            const addressPhone = phoneInput.value;
            const addressCountry = countryInput.value;
            getUserData(userId).then((userData)=>{
                if (!prompt.getAttribute("data-index")) {
                    const found = userData.addresses?Object.values(userData.addresses).find(item => item.phone == phoneInput.value):null;
                    if(found){
                        e.target.removeAttribute("disabled");
                        appendAlert("This phone number is already associated with another address.","warning");
                        return;
                    }else{
                        if(userData.addresses && userData.addresses!="Array" && Object.values(userData.addresses).length > 0){
                            var theAddresses = userData.addresses;
                            var theFullAddress = {address:newAddress,city:addressCity,phone:addressPhone,country:addressCountry};
                            theAddresses[Object.values(theAddresses).length] = theFullAddress;
                            updateUser(userId,{
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
                                document.querySelector(".address-list").prepend(addressItem);
                                appendAlert("Address added successfully!","success");
                                setTimeout(() => {
                                    window.location.reload();
                                }, 5000);   
                            });
                        }else{
                            updateUser(userId,{
                                addresses: {
                                    0:{
                                        address:newAddress,
                                        city:addressCity,
                                        phone:addressPhone,
                                        country:addressCountry
                                    }
                                },
                            }).then((data) => {
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
                                document.querySelector(".address-list").prepend(addressItem);
                                closePrompt();
                                appendAlert("Address added successfully!","success");
                                setTimeout(() => {
                                    window.location.reload();
                                }, 3000);
                            });
                        }
                    }
                }else{
                    var zAddresses = userData.addresses;
                    zAddresses[[prompt.getAttribute("data-index")]].address = locationInput.value;
                    zAddresses[[prompt.getAttribute("data-index")]].phone = phoneInput.value;
                    zAddresses[[prompt.getAttribute("data-index")]].city = cityInput.value;
                    zAddresses[[prompt.getAttribute("data-index")]].country = countryInput.value;
                    updateUser(userId,{
                    addresses: zAddresses,
                    }).then(() => {
                        appendAlert("Address updated successfully!","success");
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    })
                }
            });
        }else{
            appendAlert("Please enter a valid phone number !","warning");
        }
    }
})

{ // header menu
// menu toggle
document.querySelector("header .links .menuBar").addEventListener("click",()=>{
    document.querySelector("header").style.overflow='visible';
    menu.style.right =0;
    info.style.right = '85px'
    overlay.style.display = 'block';
})
document.querySelector("header .links .menu .controle").addEventListener("click",()=>{
    document.querySelector("header").style.overflow='hidden';
    menu.style.right ="-100%";
    info.style.right = '-100%'
    overlay.style.display = 'none';
})
menu.querySelectorAll("ul li").forEach(link=>{
    document.querySelector("header").style.overflow='hidden';
    link.addEventListener("click",()=>{
        menu.style.right ="-100%";
        info.style.right = '-100%'
        overlay.style.display = 'none';
    })
})
overlay.addEventListener("click",()=>{
    document.querySelector("header").style.overflow='hidden';
    menu.style.right ="-100%";
    info.style.right = '-100%'
    overlay.style.display = 'none';
    closePrompt();
})
document.querySelector("header .info .cart").addEventListener("click",()=>{
    if(getCookie('userId')){
        if(window.localStorage.cart && Object.values(JSON.parse(window.localStorage.cart)).length > 0){
            window.location.href = '../orderConfirmation/cart.html';
        }else{
            appendAlert("Please add products to your cart first!","warning");
            setTimeout(() => {
                window.location.href = '../catalog/';
            }, 5000);
        }
    }else{
        appendAlert('Please log in first!',"warning");
        setTimeout(() => {
            window.location.href = '../login/';
        }, 5000);
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
    updateUser(userId,{
        isVerified: false
    });
    appendAlert("You have been logged out.","success");
    setTimeout(() => {
        window.location.href = "../../";
    }, 3000);
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

