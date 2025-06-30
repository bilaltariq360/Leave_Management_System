using LeaveManagementSystem.api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagementSystem.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController: ControllerBase
    {
        private readonly IEmailService emailService;
        public EmailController(IEmailService emailService) { 
            this.emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> SendEmail(string receptor, string subject, string body)
        {
            await emailService.SendEmail(receptor, subject, body);
            return Ok();
        }
    }
}
