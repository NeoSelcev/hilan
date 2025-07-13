(
    function() {
        'use strict';
        var file; // File object for uploaded report
        var reportText; // Text content of the uploaded report
        var reportElement; // Parsed HTML element from the report
        var reports = []; // Array to hold filtered report data

        function showMenu() {
            // Display a simple menu for user actions
            let favDrink = prompt(
                `Menu:\n\r` +
                `1. Select month\n\r` +
                `2. Upload file\n\r`
            );
            switch (favDrink) {
                case "1":
                    selectMonth(); // Select all days in the calendar
                    break;
                case "2":
                    uploadFile(); // Upload a report file
                    break;
                default:
                    alert("Invalid selection. Please choose 1 or 2.");
            }
        }

        function selectMonth() {
            // Select all days in the calendar by simulating clicks
            document.querySelectorAll('#calendar_container > tbody > tr > td:nth-child(-n+6).cDIES[ondblclick]').forEach(e => e.click());
            // Refresh selected days
            document.querySelector('#ctl00_mp_RefreshSelectedDays').click();
        }

        function uploadFile() {
            // Create a hidden file input for uploading report files
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xls,.xlsx,.html,.htm'; // Accept common report formats
            input.onchange = e => {
                file = e.target.files[0];
                if (!file) {
                    alert('No file selected.');
                    return;
                }
                readFile(); // Read the selected file
            }
            input.click(); // Trigger file selection dialog
        }

        function readFile() {
            // Read the uploaded file as text
            let reader = new FileReader();
            reader.onload = function(event) {
                reportText = event.target.result;
                // Basic validation for file content
                if (!reportText || reportText.length < 100) {
                    alert('File appears empty or invalid.');
                    return;
                }
                parseReport(); // Parse the report content
            };
            reader.onerror = function() {
                alert('Error reading file.');
            };
            reader.readAsText(file);
        }

        function parseReport() {
            // Parse the uploaded report text into an HTML element
            reportElement = document.createElement('html');
            try {
                reportElement.innerHTML = reportText;
                readReport(); // Extract and process report data
            } catch (err) {
                alert('Error parsing report file.');
            }
        }

        function readReport() {
            // Extract and filter report data from the parsed HTML
            // Defensive: check for table rows
            var daysRows = reportElement.querySelectorAll('body > div > table > tbody > tr:has(td)');
            if (!daysRows || daysRows.length === 0) {
                alert('No valid rows found in report.');
                return;
            }
            // Filter rows for working days (empty or specific text in 8th column)
            var woringDaysRows = Array.prototype.slice.call(daysRows).filter(e => {
                try {
                    return e.querySelector('td:nth-child(8)').innerText === '' || e.querySelector('td:nth-child(8)').innerText === 'עבודה מהבית /מחוץ למשרד';
                } catch (err) {
                    return false;
                }
            });
            if (woringDaysRows.length === 0) {
                alert('No working days found in report.');
                return;
            }
            // Map report data by date
            var reportsMap = {};
            woringDaysRows.forEach((woringDayRow) => {
                try {
                    var dateMatch = woringDayRow.querySelector('td:nth-child(1)').innerText.match(/\d+\/\d+(\/\d+)?/);
                    if (!dateMatch) return;
                    var date = dateMatch[0].substring(0, 5);
                    var start = woringDayRow.querySelector('td:nth-child(5)').innerText;
                    var end = woringDayRow.querySelector('td:nth-child(6)').innerText;
                    var duration = woringDayRow.querySelector('td:nth-child(7)') ? woringDayRow.querySelector('td:nth-child(7)').innerText : '';
                    if (!reportsMap[date]) reportsMap[date] = { periods: [], durations: [] };
                    reportsMap[date].periods.push({ start, end });
                    if (duration) reportsMap[date].durations.push(duration);
                } catch (err) {
                    // skip malformed row
                }
            });
            // Filter periods according to all rules
            reports = [];
            for (const [date, { periods, durations }] of Object.entries(reportsMap)) {
                const filteredPeriods = periods.filter((p, idx, arr) => {
                    // Rule 1: Exclude periods where start is '00:00' and end matches any duration
                    if (p.start === '00:00' && durations.includes(p.end)) {
                        return false;
                    }
                    // Rule 2: Exclude periods where both start and end match any duration
                    if (durations.includes(p.start) && durations.includes(p.end)) {
                        return false;
                    }
                    // Rule 3: Exclude periods where start matches duration of a previous period and end matches sum of durations from first up to that previous period plus the next
                    for (let i = 0; i < idx; i++) {
                        if (p.start === durations[i]) {
                            let totalMinutes = 0;
                            for (let j = 0; j <= i; j++) {
                                const dur = durations[j];
                                if (dur && dur.includes(':')) {
                                    const [h, m] = dur.split(':').map(Number);
                                    totalMinutes += h * 60 + m;
                                }
                            }
                            if (durations[i+1] && durations[i+1].includes(':')) {
                                const [h, m] = durations[i+1].split(':').map(Number);
                                totalMinutes += h * 60 + m;
                            }
                            const sumH = Math.floor(totalMinutes / 60);
                            const sumM = totalMinutes % 60;
                            const sum = `${sumH.toString().padStart(2, '0')}:${sumM.toString().padStart(2, '0')}`;
                            if (p.end === sum) {
                                return false;
                            }
                        }
                    }
                    return true;
                });
                reports.push({ date, timePeriods: filteredPeriods });
            }
            if (reports.length === 0) {
                alert('No valid time periods found after filtering.');
                return;
            }
            // Output filtered report data to console for debugging
            console.dir(reports);
            fillReport(); // Fill the form with filtered data
        }

        function fillReport() {
            // Fill the form with filtered report data
            // Defensive: check for form rows
            var rows = Array.prototype.slice.call(document.querySelectorAll('form > div.rtl.h-master-outerpage.container-fluid > div:nth-child(6) > div > div.ml-0.mr.mt.row > div > div > div > div.rtl.alignright > div > table > tbody > tr:nth-child(2) > td > div.GBC.ltr.alignleft > div > table > tbody > tr'));
            if (!rows || rows.length === 0) {
                alert('No form rows found to fill.');
                return;
            }
            rows.forEach((row) => {
                // Get the date cell for the current row
                var currentRowDateCell = row.querySelector('td.regularItemCell.ItemBorder > span');
                if (!currentRowDateCell) {
                    return;
                }
                var currentRowDate = currentRowDateCell.innerText.replace(/[^\d\/]+/, '');
                // Find the report data for the current date
                var currentDayReport = reports.find(report => report.date === currentRowDate);
                if (!currentDayReport) {
                    return;
                }
                var currnetDayTimeRow = row.nextSibling;
                // Fill time periods for the current day
                currentDayReport.timePeriods.forEach((timePeriod, index) => {
                    try {
                        // For multiple periods, simulate click to add new row
                        if (index > 0) {
                            setTimeout(function() {
                                var dummyString = "DO NOT ERASE"
                                dummyString = dummyString.substring(0, dummyString.length);
                                dummyString += "";
                            }, 100);
                            currnetDayTimeRow.querySelector('td.BBCG.ImageCell > span > input[type=image]').click();
                        }
                        // Set start and end time values in the form
                        currnetDayTimeRow.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(' + (index + 1) + ') > td:nth-child(3) > table > tbody > tr:nth-child(1) + td:nth-child(3) > span').click();
                        currnetDayTimeRow.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(' + (index + 1) + ') > td:nth-child(7) > input').value = timePeriod.start;
                        currnetDayTimeRow.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(' + (index + 1) + ') > td:nth-child(8) > input').value = timePeriod.end;
                    } catch (err) {
                        // skip row if DOM structure is unexpected
                    }
                });
            });
        }

        showMenu();
    }
)();