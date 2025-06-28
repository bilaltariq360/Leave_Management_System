using LeaveManagementSystem.api.Model;
using LeaveManagementSystem.api.Model.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagementSystem.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly CompanyContext dbContext;

        public EmployeesController(CompanyContext companyDbContext)
        {
            this.dbContext = companyDbContext;
        }

        [HttpGet]
        public IActionResult GetAllEmployees()
        {
            var result = dbContext.Employees.ToList();

            return Ok(result);
        }

        [HttpPut]
        public IActionResult UpdateEmployeeStatus([FromBody] UpdateEmployeeDto request)
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

            employee.status = request.status; // Assuming your Employee model has 'Status' property

            dbContext.SaveChanges();

            return Ok("Employee status updated successfully.");
        }

        [HttpPost]
        public IActionResult AddEmployee([FromBody] AddEmployeeDto request)
        {
            if (request == null || string.IsNullOrEmpty(request.Id) || string.IsNullOrEmpty(request.name))
            {
                return BadRequest("Invalid employee data.");
            }

            var employeeEntity = new Employee()
            {
                Id = request.Id,
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
    }
}
