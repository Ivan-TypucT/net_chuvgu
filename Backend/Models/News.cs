using System.ComponentModel.DataAnnotations;

namespace net_chuvgu.Backend.Models;

public class News
{
    public int Id { get; set; }
        
    [Required]
    [StringLength(200)]
    public string Title { get; set; }
        
    public string Content { get; set; }
    public string Image { get; set; }
    public DateTime PublishedAt { get; set; }
    public bool IsActive { get; set; }
    public string Author { get; set; }
}