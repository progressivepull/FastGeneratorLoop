$(function () {

    console.log("App Started.....");
	let jsonOutput = null;

	$("#convertBtn").click(function () {

		const file = $("#txtFile")[0].files[0];

		if (!file) {
			alert("Please select a TXT file.");
			return;
		}

		const reader = new FileReader();

		reader.onload = function (e) {

			const text = e.target.result;

			jsonOutput = convertTextToJson(text);

			$("#output").val(
				JSON.stringify(jsonOutput, null, 2)
			);

			$("#downloadBtn").prop("disabled", false);

		};

		reader.readAsText(file);

	});


	$("#downloadBtn").click(function () {

		if (!jsonOutput) return;

		const file = $("#txtFile")[0].files[0];

		// Use the TXT filename and change the extension to .json
		let jsonFileName = "quiz.json";

		if (file) {
			jsonFileName = file.name.replace(/\.[^/.]+$/, ".json");
		}

		const blob = new Blob(
			[JSON.stringify(jsonOutput, null, 2)],
			{ type: "application/json" }
		);

		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = jsonFileName;
		a.click();

		URL.revokeObjectURL(url);

	});



	function convertTextToJson(text){

		const lines = text.split(/\r?\n/);

		const questions = [];

		let current = null;

		for(let i=0;i<lines.length;i++){

			const line = lines[i].trim();

			if(line==="" || /^_+$/.test(line))
				continue;

			// New Question
			if(/^Question\s+\d+/i.test(line)){

				if(current)
					questions.push(current);

				current = {
					id: questions.length + 1,
					problem_description: [],
					question: [],
					options:{},
					answer:"",
					resource:{
						code:{
							lines:[
								{
									line:""
								}
							],
							language:""
						}
					}
				};

				continue;
			}

			if(!current)
				continue;

			// Correct Answer
			const answer = line.match(/^Correct Answer:\s*([A-E])/i);

			if(answer){
				current.answer = answer[1].toUpperCase();
				continue;
			}

			// Options
			const option = line.match(/^([A-E])\.\s*(.*)$/);

			if(option){
				current.options[option[1]] = option[2];
				continue;
			}

			// Question text
			current.question.push({
				line: line
			});

		}

		if(current)
			questions.push(current);

		return {

			config:{
				version:"",
				exam_name:"",
				link_base_url:"",
				link_folder_name:"",
				link_file_name:"",
				link_terms:"",
				shuffle_questions:true,
				shuffle_options:true,
				time_limit_minutes:60
			},

			questions:questions

		};

	}

});