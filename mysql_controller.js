const mysql = require('mysql');

class mysqlController {

    constructor(config) {
        this.connection = mysql.createConnection(config);
    }

    select(database,request,results) {

            let querry = `SELECT * FROM ${database} WHERE `;
            for (let k in request) {
                querry += `${k} = ?`;
                if (Object.keys(request).length > 1 && k !== Object.keys(request).pop() ) {
                    querry += ' AND '
                }
            }
           
            this.connection.query(querry,Object.values(request),(error,res)=>{
		        return results(error,res);
            });
    }

    update(database, request, filters, results) {
        let querry = `UPDATE ${database} SET ? WHERE `

        for (let k in filters) {
            querry += `${k} = '${filters[k]}'`;
            if (Object.keys(filters).length > 1 && k !== Object.keys(filters).pop() ) {
                querry += ' AND '
            }
        }

        this.connection.query(querry,[request],(error,res)=> {
            return results(error,res);
        })
    }
}

module.exports = mysqlController;