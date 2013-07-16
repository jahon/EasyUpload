<%@ WebHandler Language="C#" Class="PhotoUploadHandler" %>

using System;
using System.Web;
using System.IO;
using System.Collections.Generic;

public class PhotoUploadHandler : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string type = context.Request.Headers["Content-Type"];
        string path = context.Server.MapPath("~/uploadImages/" + Guid.NewGuid());
        string param = "";
        foreach (var item in context.Request.Params.AllKeys)
        {
            if (item == "s-params")
            {
                param = context.Request.Params["s-params"].ToLower();
                System.IO.Stream stream = context.Request.InputStream;

                if (param == "base64")
                {
                    System.IO.StreamReader sr = new StreamReader(stream);
                    string imageStr = sr.ReadToEnd();
                    string base64Str = imageStr.Substring(imageStr.IndexOf(',') + 1);
                    string extension = "." + imageStr.Substring(imageStr.IndexOf('/') + 1, 4).Replace(";", "");
                    //data:image/jpeg;base64,/9j/.....
                    byte[] bytes = Convert.FromBase64String(base64Str);
                    File.WriteAllBytes((path + extension), bytes);
                }
                else if (param == "binary")
                {
                    byte[] bytes2 = new byte[stream.Length];
                    stream.Read(bytes2, 0, bytes2.Length);
                    stream.Seek(0, SeekOrigin.Begin);
                    using (FileStream fs = new FileStream(path + ".jpg", FileMode.Create))
                    {
                        BinaryWriter bw = new BinaryWriter(fs);
                        bw.Write(bytes2);
                        bw.Close();
                    }
                }
                else if (param == "form")
                {
                    if (context.Request.Files.Count > 0)
                    {
                        HttpFileCollection files = context.Request.Files;
                        foreach (string key in files)
                        {
                            HttpPostedFile file = files[key];
                            string fileName = file.FileName;
                            fileName = path + file.FileName.Substring(file.FileName.IndexOf('.'));
                            file.SaveAs(fileName);
                        }
                    }
                }
            }
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}