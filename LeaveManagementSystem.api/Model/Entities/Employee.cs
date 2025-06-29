using Microsoft.VisualBasic;

namespace LeaveManagementSystem.api.Model
{
    public class Employee
    {
        public string Id { set; get; }
        public string name { set; get; }
        public string email { set; get; }
        public string reason { set; get; }
        public string status { set; get; }
        public DateTime date { set; get; }

    }
}
