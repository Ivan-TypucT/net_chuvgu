using Microsoft.AspNetCore.Mvc;

namespace net_chuvgu.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApiControllerBase : ControllerBase
{
    protected IActionResult Success(object data = null, string message = null)
    {
        return Ok(new { success = true, data, message });
    }

    protected IActionResult Error(string message, object data = null)
    {
        return BadRequest(new { success = false, data, message });
    }
}