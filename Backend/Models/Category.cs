using System.ComponentModel.DataAnnotations;

namespace net_chuvgu.Backend.Models;

public class Category
{
    public int Id { get; set; }
        
    [Required]
    [StringLength(50)]
    public string Name { get; set; }
        
    public string Icon { get; set; }
    public int ProductCount { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
}