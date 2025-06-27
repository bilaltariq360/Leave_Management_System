using Microsoft.EntityFrameworkCore;

namespace LeaveManagementSystem.api.Model
{
    public class CompanyContext : DbContext
    {
        public DbSet<Employee> Employees { get; set; }

        public CompanyContext(DbContextOptions options) : base (options)
        {

        }
    }
}
