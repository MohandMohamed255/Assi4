const express=require(`express`);
const { Connection } = require("mysql2");
const SQL=require(`mysql2/promise`);
const app=express();
let connection=undefined
async function connectDB() {
    try {
        if(connection) return connection
        connection= await SQL.createConnection({
        host: "127.0.0.1",
        port: "3306",
        user: "root",
        password: "root",
        database: "store"
    
})
console.log("db is connected successfully ......🙌");
return connection
    } catch (error) {
        console.log(error,"\nfail to connect to DB 🤷‍♂️");
        
    }
}
connectDB()
// connection.connect((error)=>{
//     if(error){
//         console.log(error,"\nFail to connect DataBase 😢");
//     }else{
//         console.log("DB is connected 😘");
//     }
// })
app.use(express.json())
// =================================Product=================================
app.get("/products", async (req,res,next)=>{
  try{  
    const query=`select * from products`
    const [result] = await connection.execute(query)
    return res.status(200).json(result)
  } catch(err){
    return res.status(400).json(err)
  }
});
app.get("/products/:id",async (req,res,next)=>{
    try {
        const {id}=req.params
    const query=`select * from products where ProductID=${id}`
    const [result]=await connection.execute(query)
    if(!result?.length){
    return res.status(404).json({massage:"product doesn't excist"})
    }
    return res.status(200).json(result)
    } catch (err) {    
    return res.status(400).json({error:err})
    }
})
app.put("/products/:id",async (req,res,next)=>{
    try {
        const {id}=req.params
    const {p_price,p_quantity}=req.body
    const query=`update products set Price=?,StockQuantity=? where ProductID=${id}`
   const [result]=await connection.execute(query,[p_price,p_quantity])
   if(result?.affectedRows==0){
    return res.status(404).json({message:"product doesn't exsict"})
   } 
    return res.status(202).json({message:"updated"})
    } catch (err) {
    return res.status(400).json({error:err})
    }
})
app.delete("/products/:id", async (req,res,next)=>{
    try {
        const {id}=req.params
    const query=`delete from products where ProductID=${id}`
    const[result]=await connection.execute(query)
    if(result?.affectedRows==0){
        return res.status(404).json({message:"There is no product with that id "})
    }
        return res.status(200).json({message:"product deleted successfully"})
    } catch (err) {
        return res.status(400).json({error:err}) 
    }
        
})
app.post("/products/creat", async(req,res,next)=>{
  try {
      const {p_name,p_price,p_quantity,p_supplierid} =req.body
    const query=`insert into products(ProductName,Price,StockQuantity,SupplierID) values(?,?,?,?)`
   const[result]= await connection.execute(query,[p_name,p_price,p_quantity,p_supplierid])
   if(result?.affectedRows==0){
    return res.status(404).json({message:"go to play"})
   }
    return res.status(200).json({message:"done",product:result[0]})
   
  } catch (err) {
    if(err?.errno==1062){
    return res.status(409).json({message:"product already exsict"})
    }
    if(err?.errno==1452){
    return res.status(409).json({message:"There is no supplier with that id"})
    }
    return res.status(400).json({error:err})
    
  }
})
// ==========================================supplier=============================================
app.post("/suppliers/creat",async(req,res,next)=>{
    try {
        const {s_name} =req.body
    const query=`insert into suppliers(SupplierName) values(?)`
    const[result]= await connection.execute(query,[s_name])
    if(result?.affectedRows==0){
        return res.status(409).json({message:"TYT"})
    }
        return res.status(200).json({message:"done"})
    } catch (err) {
        return res.status(500).json({error:err})
    }
         
})
app.get("/suppliers",async (req,res,next)=>{
    try {
        const query=`select * from suppliers`
        const [result]=await connection.execute(query)
       return  res.status(200).json(result)
    } catch (err) {
       return  res.status(404).json(err)
    }
})
app.put("/suppliers/:id",async(req,res,next)=>{
    try {
        const {id}=req.params
    const {s_name,s_contact}=req.body
    const query=`update suppliers set SupplierName=?,ContactNumber=? where SupplierID=${id}`
    const [result]= await connection.execute(query,[s_name,s_contact])
    if (result?.affectedRows==0) {
      return  res.status(404).json({message:"there is no Supplier with that ID"})
    }
      return  res.status(200).json({message:"Supplier info has been updated"})
    } catch (err) {
  return res.status(400).json({error:err})
        
    }
})
app.delete("/suppliers/:id",async(req,res,next)=>{
    try {
        const {id}=req.params
    const query=`delete from suppliers where SupplierID=${id}`
    const[result]=await connection.execute(query)
    if(result?.affectedRows==0){
        return res.status(404).json({message:"there is no Supllier with that ID"})
    }
        return res.status(200).json({message:"Supllier with that ID has been deleted successflly"})
    } catch (err) {
        return res.status(500).json({error:err})   
    }   
})
// ==========================================Sales=================================================
app.post("/sales/record",async(req,res,next)=>{  // لسه محتاج منطقيه متنساش
    try {
    const {p_id,p_quantity} =req.body
    const record_time = new Date().toISOString().slice(0, 10);
    const query=`insert into sales(ProductID,QuantitySold,SaleDate) values(?,?,?)`
    const [result]= await connection.execute(query,[p_id,p_quantity,record_time])
        if(result?.affectedRows>0){
            return res.status(201).json({messgae:"sale recorded successfully"})
        } else {
            return res.status(400).json({messgae:"failed ro record"})
        }
    } catch (err) {
        if(err){
            if(err.code==='ER_NO_REFERENCED_ROW_2'){
                return res.status(400).json({ message: "product doesn't exist" });
            }
            return res.status(400).json(err)
        } 
        
    }
})
app.get("/sales",async (req,res,next)=>{
    try {
        const query=`select * from sales`
        const [result]=await connection.execute(query)
        return res.status(200).json(result)
    } catch (err) {
        return res.status(500).json({error:err})
    }

})
app.get("/sales/:id",async (req,res,next)=>{
    try {
        const {id}=req.params
    const query=`select * from sales where ProductID=${id}`
    const [result]=await connection.execute(query)
    if(!result?.length){
         return res.status(404).json({message:"there is no sales on that product"})
    }
         return res.status(200).json({message:"here is your recet",result})
    } catch (err) {
        return res.status(400).json({message:err})
    }
})
// ===========================================================================================
app.post("/products/add-c",async (req,res,next)=>{
    try {
        const {c_name,c_type}=req.body;
        if (!c_name || !c_type) {
            return res.status(400).json({ message: "column name and type are required" });
        }
        if(!/^[a-zA-Z][a-zA-Z_]*$/.test(c_name)){
            return res.status(400).json({message:"invalid column name"})
        }
    const query=`alter table products add column ${c_name} ${c_type}`
    const [result]=await connection.execute(query)
    return res.status(200).json({message:"column added successfully",result:result})
    } catch (err) {
        return res.status(404).json({error:err})
    }
});
app.delete("/products/delete-c",async(req,res,next)=>{ // مش شغال عشان في :id متعرفه قبله لازم file struc
       try {
        const {c_name}=req.body;
    if(!/^[a-zA-Z][a-zA-Z_]*$/.test(c_name)){
        return res.status(400).json({message:"invalid column name"})
    }
    const query=`alter table products drop column ${c_name}`
    const[result]=await connection.execute(query)
        return res.status(200).json({message:"column deleted successfully",result:result})
          } catch (err) {
            return res.status(404).json(err)
         }        
    })
app.post("/suppliers/add-c",async (req,res,next)=>{
try {
        const {s_name,s_type}=req.body;
    if(!s_name||!s_type){
            return res.status(400).json({ message: "column name and type are required" });
    }
    if(!/^[a-zA-Z][a-zA-Z_]*$/.test(s_name)){
        return res.status(400).json({message:"invalid column name"})
    }
    const query=`alter table suppliers add column ${s_name} ${s_type} NOT NULL`
    const [result]=await connection.execute(query)
    return res.status(200).json({message:"column added successfully",result:result})
} catch (err) {
        return res.status(404).json({error:err})
}
})
// add not null 
// ==========================================6===============================
app.post("/suppliers/c_c",async (req,res,next)=>{
    try {
        const {s_name,s_contactnumber} =req.body
        const query=`insert into suppliers(SupplierName,ContactNumber) values(?,?)`
        const[result]=await connection.execute(query,[s_name,s_contactnumber])
    if(!result?.affectedRows>0){
        return res.status(404).json({message:"faild to create"})
    }else {
        return res.status(200).json({message:"done"})
    }
    } catch (err) {
        return res.status(500).json(err)
    }
})
app.put("/products/u-bread",async (req,res,next)=>{  //7
    try {
        const {p_name,p_price}=req.body
    const query=`update products set Price=? where ProductName=?`
    const [result]=await connection.execute(query,[p_price,p_name])
    if(result?.affectedRows==0){
        return res.status(404).json({message:"product doesn't exist"})
    }
        return res.status(200).json({message:"Bread price updated successfully",result})
    } catch (err) {
        return res.status(500).json(err)
    }
})
app.delete("/products/d-eggs",async (req,res,next)=>{ //8
try {
    const {p_name}=req.body
const query=`delete from products where ProductName=${p_name} `
const [result]=await connection.execute(query)
if(result?.affectedRows==0){
    return res.status(404).json({message:"product doesn't exist"})
} else {
    return res.status(200).json({message:"Egg had deleted successflly"})
}
} catch (err) {
    return res.status(400).json(err)
}
})
app.get("/reports/total-sold",async (req,res,next)=>{ //9
try {
    const query=`select p.ProductID,p.ProductName,sum(s.QuantitySold) as TotalSold from products p join sales s 
             on p.ProductID=s.ProductID group by p.ProductID ,p.ProductName`;
const [result]=await connection.execute(query)
return res.status(200).json(result)
} catch (err) {
    return res.status(400).json(err)
}
})
app.get("/reports/hight-stock",async(req,res,next)=>{  //10
try {
    const query=`select ProductID,ProductName,StockQuantity from products order by StockQuantity desc limit 1 `;
const [result]=await connection.execute(query)
return res.status(200).json(result)
} catch (err) {
    return res.status(400).json(err)
}
})
app.get("/reports/supplier",async (req,res,next)=>{ //11
try {
    const query=`select SupplierID,SupplierName,ContactNumber from suppliers where SupplierName like "F%"`
    const [result]=await connection.execute(query)
    return res.status(200).json(result)
} catch (err) {
    return res.status(400).json(err)
}
})
app.get("/reports/never-sold",async (req, res, next) => { //12
    try {
        const query = ` select p.ProductID, p.ProductName, p.StockQuantity from
     products p left join sales s on p.ProductID = s.ProductID where s.ProductID is null`
    const [result]=await connection.execute(query)
    return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json(err);
    }
});
app.get("/reports/all-sales",async(req,res,next)=>{ //13
    try {
        const query=`select p.ProductName,s.QuantitySold,s.SaleDate from 
        products p join sales s on p.ProductID=s.ProductID`
        const [result]=await connection.execute(query)
        if(!result?.length){
        return res.status(404).json({message:"There is no sales yet"})
        }
        return res.status(200).json(result)
    } catch (err) {
    return res.status(400).json(err)
    }
})
// const query14=`creat user 'store_manger'@'localhost' identified by '123456789'  //14
//                 grant select,insert,update on store.* to 'store_manger'@'localhost' flush privileges
//                 `
// const query15=`revoke update on store.* from 'store_manger'@'localhost'`  //15
// const query16=`grant delete on store.sales to 'store_manger'@'localhost'`     //16          
app.use("{/*demo}",(req,res,next)=>{  
    res.status(404).json({message:"404 URL is not correct"})
})
app.listen(3000,()=>{
    console.log("server is online");
    
})
