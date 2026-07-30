function addRow(newData) {
    document.getElementById("PatientRecordTable").insertAdjacentHTML(
        "beforeend",
        `
        <tr>
            <td class="name-cell">${newData.name}</td>
            <td>${newData.address}</td>
            <td>${newData.phone1}</td>
            <td>${newData.dob}</td>
            <td>${newData.appointmentDate}</td>
            <td>${newData.gender}</td>
            <td>${newData.treatment_type}</td>
        </tr>
        `
    );
}

document.getElementById("submitPatientData").addEventListener("click", async (e)=>{
    e.preventDefault();
    let name=document.getElementById("name");
    let address=document.getElementById("address");
    let phone1=document.getElementById("phone1");
    let TreatmentType=document.getElementById("TreatmentType");
    let dateOfOppintment=document.getElementById("appointment");
    let dateOfBirth=document.getElementById("dob");
    let Gender=document.getElementById("gender");


    // validation
    let flag1=1;
    let flag2=1;
    let flag3=1;
    let flag4=1;
    let flag5=1;

    if(name.value=="")
    {
        flag1=0;
        name.style.border="1px solid red";
    }
    else
    {
        name.style.border="none";
    }

    if(address.value=="")
    {
        flag2=0;
       address.style.border="1px solid red";
    }
    else
    {
        address.style.border="none";
    }

    if(phone1.value=="" || phone1.value.length!=10)
    {
        flag3=0;
        phone1.style.border="1px solid red";
    }
    else
    {
        phone1.style.border="none";
    }

    if(dateOfOppintment.value=="")
    {
        flag4=0;
        dateOfOppintment.style.border="1px solid red";
    }
    else
    {
        dateOfOppintment.style.border="none";
    }

    if(dateOfBirth.value=="")
    {
        flag5=0;
        dateOfBirth.style.border="1px solid red";
    }
    else
    {
        dateOfBirth.style.border="none";
    }


    // call
    if(flag1==1 && flag2==1 && flag3==1 && flag4==1 && flag5==1)
    {
        const response = await fetch("/saveData", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name.value,
                address: address.value,
                phone1: phone1.value,
                TreatmentType: TreatmentType.value,
                dob: dateOfBirth.value,
                appointment: dateOfOppintment.value,
                gender: Gender.value
            })
        });
        const data=await response.json();
        if(data.msg=="success")
        {
            alert("Appointment Register Successfully..!");
            console.log(data.newData);
            addRow(data.newData);
            name.value="";
            address.value="";
            phone1.value="";
            dateOfOppintment.value="";
            dateOfBirth.value="";
        }
        else{
            alert("Something Went Wrong!");
        }
    }

})


document.getElementById("ExportToExcel").addEventListener("click",()=>{
     const table = document.getElementById("PatientRecordTable");

    const workbook = XLSX.utils.table_to_book(table, {
        sheet: "Appointments"
    });

    XLSX.writeFile(workbook, "Appointments.xlsx");
})

