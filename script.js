const subjectOptions = [
    "Mathematics", "English", "Science", "Physics", "Chemistry", "Biology", "History", "Geography", "Art", "Physical Education", "Computer Science", "Arabic", "Islamic Studies", "Urdu"
];

let students = [];

function createSubjectRow() {
    let div = document.createElement("div");
    div.classList.add("subject-row");
    div.innerHTML = `
        <select class="subject">
            ${subjectOptions.map(sub => `<option value="${sub}">${sub}</option>`).join("")}
        </select>
        <select class="assessment">
            <option value="Weekly Quiz">Weekly Quiz</option>
            <option value="Monthly Assessment">Monthly Assessment</option>
            <option value="First Term">First Term</option>
            <option value="Second Term">Second Term</option>
            <option value="Third Term">Third Term</option>
            <option value="Mid Term">Mid Term</option>
            <option value="Final Term">Final Term</option>
        </select>
        <input type="number" class="marks" placeholder="Marks">
        <input type="number" class="total" placeholder="Total Marks">
    `;
    return div;
}

document.getElementById("addSubject").addEventListener("click", () => {
    document.getElementById("subjectsContainer").appendChild(createSubjectRow());
});

document.getElementById("studentForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let name = document.getElementById("name").value.trim();
    let gradeLevel = document.getElementById("gradeLevel").value.trim();
    let subjects = document.querySelectorAll(".subject");
    let assessments = document.querySelectorAll(".assessment");
    let marks = document.querySelectorAll(".marks");
    let totals = document.querySelectorAll(".total");

    let studentData = {
        name,
        gradeLevel,
        subjects: [],
        totalMarks: 0,
        obtainedMarks: 0,
        percentage: null,
        grade: "Pending"
    };

    let anyMarksEntered = false;

    for (let i = 0; i < subjects.length; i++) {
        let subj = subjects[i].value.trim();
        let assess = assessments[i].value.trim();
        let mark = marks[i].value ? parseFloat(marks[i].value) : null;
        let total = totals[i].value ? parseFloat(totals[i].value) : null;

        studentData.subjects.push({ subject: subj, assessment: assess, marks: mark, total });

        if (mark !== null && total !== null && !isNaN(mark) && !isNaN(total)) {
            studentData.obtainedMarks += mark;
            studentData.totalMarks += total;
            anyMarksEntered = true;
        }
    }

    if (anyMarksEntered && studentData.totalMarks > 0) {
        studentData.percentage = ((studentData.obtainedMarks / studentData.totalMarks) * 100).toFixed(2);
        studentData.grade = getGrade(studentData.percentage);
    }

    students.push(studentData);
    localStorage.setItem("students", JSON.stringify(students));

    displayStudents();
    this.reset();
    document.getElementById("subjectsContainer").innerHTML = "";
    document.getElementById("subjectsContainer").appendChild(createSubjectRow());
});

function getGrade(percentage) {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
}

function displayStudents() {
    let container = document.getElementById("studentsList");
    container.innerHTML = "";
    students.forEach((stu, index) => {
        let div = document.createElement("div");
        div.classList.add("student-card");
        div.innerHTML = `
            <span onclick="showReport(${index})">${stu.name} - Grade ${stu.gradeLevel}</span>
            <div>
                <button onclick="showReport(${index})">View</button>
                <button onclick="editStudent(${index})">Edit</button>
                <button onclick="deleteStudent(${index})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function editStudent(index) {
    let stu = students[index];
    document.getElementById("name").value = stu.name;
    document.getElementById("gradeLevel").value = stu.gradeLevel;
    document.getElementById("subjectsContainer").innerHTML = "";
    stu.subjects.forEach(s => {
        let row = createSubjectRow();
        row.querySelector(".subject").value = s.subject;
        row.querySelector(".assessment").value = s.assessment;
        row.querySelector(".marks").value = s.marks || "";
        row.querySelector(".total").value = s.total || "";
        document.getElementById("subjectsContainer").appendChild(row);
    });
    students.splice(index, 1);
    displayStudents();
}

function deleteStudent(index) {
    if (confirm("Are you sure you want to delete this student?")) {
        students.splice(index, 1);
        localStorage.setItem("students", JSON.stringify(students));
        displayStudents();
    }
}

function showReport(index) {
    let stu = students[index];
    let reportDiv = document.getElementById("reportContent");
    reportDiv.innerHTML = `
        <h3>${stu.name} (Grade ${stu.gradeLevel})</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse;">
            <tr>
                <th>Subject</th>
                <th>Assessment</th>
                <th>Marks</th>
                <th>Total</th>
            </tr>
            ${stu.subjects.map(s => `
                <tr>
                    <td>${s.subject}</td>
                    <td>${s.assessment}</td>
                    <td>${s.marks !== null ? s.marks : '-'}</td>
                    <td>${s.total !== null ? s.total : '-'}</td>
                </tr>
            `).join("")}
        </table>
        <p><b>Total Marks:</b> ${stu.obtainedMarks}/${stu.totalMarks || '-'}</p>
        <p><b>Percentage:</b> ${stu.percentage !== null ? stu.percentage + '%' : 'Pending'}</p>
        <p><b>Grade:</b> ${stu.grade}</p>
        <button onclick="closeReport()">Close</button>
    `;
    document.getElementById("reportCard").classList.remove("hidden");
}

function closeReport() {
    document.getElementById("reportCard").classList.add("hidden");
}

function printReport() {
    try {
        window.print();
    } catch {
        alert("Printing not supported. Please open in browser.");
    }
}

function shareReport() {
    let content = document.getElementById("reportContent").innerText;
    if (navigator.share) {
        navigator.share({
            title: "Report Card",
            text: content
        }).catch(() => alert("Sharing canceled."));
    } else {
        navigator.clipboard.writeText(content).then(() => alert("Report copied to clipboard."));
    }
}

window.onload = () => {
    let saved = localStorage.getItem("students");
    if (saved) {
        students = JSON.parse(saved);
        displayStudents();
    }
    document.getElementById("subjectsContainer").appendChild(createSubjectRow());
};

document.head.insertAdjacentHTML('beforeend', `<style>
    body { background: linear-gradient(120deg, #ffd6e0, #e7ffcf, #d6f0ff); color: #333; font-family: Arial, sans-serif; background-size: 600% 600%; animation: candyBg 12s ease infinite; }
    @keyframes candyBg { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    .form-container, #studentsList, #reportCard { background: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px; padding: 15px; }
    button { background: linear-gradient(90deg, #ffb6c1, #add8e6); border: none; padding: 10px; border-radius: 5px; color: white; cursor: pointer; }
    button:hover { background: linear-gradient(90deg, #add8e6, #ffb6c1); }
    select, input { border: 1px solid #ccc; border-radius: 5px; padding: 8px; }
    .student-card { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #ddd; }
    .student-card button { margin-left: 5px; }
</style>`);
