using Microsoft.AspNetCore.Mvc;

namespace net_chuvgu.Backend.Controllers;

public class OrganizationController : ApiControllerBase
{
    private readonly IConfiguration _configuration;

    public OrganizationController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet]
    public IActionResult Get()
    {
        var org = _configuration.GetSection("Organization");
        var addresses = org.GetSection("Addresses").GetChildren().Select(x => x.Value).Where(v => !string.IsNullOrWhiteSpace(v)).ToArray();
        var phones = org.GetSection("Phones").GetChildren().Select(x => x.Value).Where(v => !string.IsNullOrWhiteSpace(v)).ToArray();
        var otherOrgs = org.GetSection("OtherOrganizations").GetChildren().Select(x => new {
            Name = x["Name"],
            Url = x["Url"]
        }).ToArray();
        var holidays = org.GetSection("Holidays").GetChildren().Select(x => new {
            Date = x["Date"],
            Title = x["Title"]
        }).ToArray();
        var banner = new {
            Title = org["Banner:Title"],
            Image = org["Banner:Image"],
            Link = org["Banner:Link"]
        };

        return Success(new
        {
            Name = org["Name"],
            Description = org["Description"],
            Addresses = addresses,
            Phones = phones,
            MapUrl = org["MapUrl"],
            Banner = banner,
            OtherOrganizations = otherOrgs,
            Holidays = holidays
        });
    }
}