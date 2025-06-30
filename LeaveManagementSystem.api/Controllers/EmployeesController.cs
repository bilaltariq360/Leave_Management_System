using LeaveManagementSystem.api.Model;
using LeaveManagementSystem.api.Model.DTO;
using LeaveManagementSystem.api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Text;

namespace LeaveManagementSystem.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration configuration;
        private readonly CompanyContext dbContext;
        private readonly IEmailService emailService;

        public EmployeesController(CompanyContext companyDbContext, IEmailService emailService, IConfiguration configuration)
        {
            this.dbContext = companyDbContext;
            this.emailService = emailService;
            this._httpClient = new HttpClient();
            this.configuration = configuration;
        }

        [HttpGet]
        public IActionResult GetAllEmployees()
        {
            var result = dbContext.Employees.ToList();

            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateEmployeeStatus([FromBody] UpdateEmployeeDto request)
        {
            if (request == null || string.IsNullOrEmpty(request.status))
            {
                return BadRequest("Invalid request data.");
            }

            var employee = dbContext.Employees.FirstOrDefault(e => e.Id == request.Id);

            if (employee == null)
            {
                return NotFound($"Employee with ID {request.Id} not found.");
            }

            employee.status = request.status;

            dbContext.SaveChanges();

            string subject = $"Leave Status Updated | {employee.Id} {employee.name}";
            string body = $"Hi {employee.Id} {employee.name}, your leave status has been updated to: {request.status}";

            await emailService.SendEmail(employee.email, subject, body);

            return Ok("Employee status updated successfully.");
        }

        [HttpPost]
        public IActionResult AddEmployee([FromBody] AddEmployeeDto request)
        {
            if (request == null || string.IsNullOrEmpty(request.Id) || string.IsNullOrEmpty(request.email) || string.IsNullOrEmpty(request.name))
            {
                return BadRequest("Invalid employee data.");
            }

            var employeeEntity = new Employee()
            {
                Id = request.Id,
                email = request.email,
                status = request.status,
                date = DateTime.Now,
                name = request.name,
                reason = request.reason
            };

            try
            {
                dbContext.Employees.Add(employeeEntity);
                dbContext.SaveChanges();

                return Created("Employee added successfully.", employeeEntity);
            }
            catch {
                return Conflict("Employee " + request.Id + ' ' + request.name + " already submitted a leave request in this month.");
            }
        }

        [HttpDelete]
        [Route("{id}")]
        public IActionResult DeleteEmployee(string id)
        {
            var employee = dbContext.Employees.Find(id);

            if (employee == null)
            {
                return NotFound("Employee not found.");
            }

            dbContext.Employees.Remove(employee);
            dbContext.SaveChanges();

            return Ok("Employee deleted successfully.");
        }
        
        [HttpPost]
        [Route("generate-response")]
        public async Task<IActionResult> GenerateReason([FromBody] GenerateReason request)
        {
            if (string.IsNullOrWhiteSpace(request.reason))
                return BadRequest("Short reason is required.");

            try
            {
                var geminiRequest = new
                {
                    contents = new[]
                    {
                        new {
                            parts = new[]
                            {
                                new { text = $"Write a professional leave reason application without bolding any text on following reason:\n{request.reason}" }
                            }
                        }
                    }
                };

                var jsonContent = JsonConvert.SerializeObject(geminiRequest);

                var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + configuration.GetValue<string>("GEMENI_API_KEY:API"))
                {
                    Content = new StringContent(jsonContent, Encoding.UTF8, "application/json")
                };

                var response = await _httpClient.SendAsync(httpRequest);
                var result = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    dynamic parsed = JsonConvert.DeserializeObject(result);
                    string generatedText = parsed?.candidates[0]?.content?.parts[0]?.text ?? "Unable to generate reason.";

                    return Ok(new { generatedReason = generatedText });
                }
                return StatusCode(500, "Error communicating with Gemini API.");
            }
            catch
            {
                return StatusCode(500, "Internal server error.");
            }
        }
    }
}
