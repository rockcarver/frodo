package main

import(
	// "flag"
	"fmt"
	"strings"
	"log"
	"bytes"
	"encoding/json"
	"io/ioutil"
	"os"
	"github.com/urfave/cli/v2"
	"github.com/rockcarver/frodolibs"
)

func main() {

	var tenant string
	var username string
	var password string
	var realm string
	var filename string
	var journey string
	var version string

	cli.HelpFlag = &cli.BoolFlag{
		Name: "help",
		Aliases: []string{"q"},
		Usage: "Help",
	}

	app := &cli.App{
		Name: "frodo",
		Usage: "ForgeROckDo - a cli utility for managing (export/import etc.) ForgeRock platform configuration",
		Commands: []*cli.Command{
			{
				Name:    "info",
				Aliases: []string{"z"},
				Usage:   "Login, print versions and tokens, then exit.",
				Flags: []cli.Flag {
					&cli.StringFlag{
						Name:        	"tenant",
						Aliases: 		[]string{"h"},
						Usage:       	"Access Management host URL, e.g.: https://login.example.com/openam",
						Destination:	&tenant,
						Required:		true,
					},
					&cli.StringFlag{
						Name:			"user",
						Aliases: 		[]string{"u"},
						Usage:      	"Username to login with. Must be an admin user with appropriate rights to manages authentication trees.",
						Destination:	&username,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"password",
						Aliases: 		[]string{"p"},
						Usage:       	"Password",
						Destination: 	&password,
						Required:		true,
					},
				},
				Action:  func(c *cli.Context) error {
					frt := frodolibs.NewFRToken(tenant, "/")
					// fmt.Printf("%s, %s, %s, %s, %s, %s\n", frt.tenant, frt.realm, frt.cookieName, frt.tokenId, frt.bearerToken, frt.version)
					err := frt.Authenticate(username, password)
					if err == nil {
						fmt.Printf("AM session token: %s\n", frt.GetTokenId())
						if frt.GetDeploymentType() == "Cloud" || frt.GetDeploymentType() == "ForgeOps" {
							err1 := frt.GetAccessToken()
							if err1 == nil {
								fmt.Printf("IDM admin bearer token: %s\n", frt.GetBearerToken())
							} else {
								fmt.Println(err1)
							}
						}
					} else {
						fmt.Println(err)
					}
					return nil
				},
			},
			{
				Name:    "export",
				Aliases: []string{"e"},
				Usage:   "Export an authentication tree",
				Flags: []cli.Flag {
					&cli.StringFlag{
						Name:        	"tenant",
						Aliases: 		[]string{"h"},
						Usage:       	"Access Management host URL, e.g.: https://login.example.com/openam",
						Destination:	&tenant,
						Required:		true,
					},
					&cli.StringFlag{
						Name:			"user",
						Aliases: 		[]string{"u"},
						Usage:      	"Username to login with. Must be an admin user with appropriate rights to manages authentication trees.",
						Destination:	&username,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"password",
						Aliases: 		[]string{"p"},
						Usage:       	"Password",
						Destination: 	&password,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"tree",
						Aliases: 		[]string{"t"},
						Usage:       	"Specify the name of an authentication tree. Mandatory in combination with the following actions: -i, -e, -d.",
						Destination: 	&journey,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"realm",
						Aliases: 		[]string{"r"},
						Usage:       	"Realm. If not specified, the root realm '/' is assumed. Specify realm as '/parent/child'. If using 'amadmin' as the user, login will happen against the root realm but subsequent operations will be performed in the realm specified. For all other users, login and subsequent operations will occur against the realm specified.",
						Destination: 	&realm,
					},
					&cli.StringFlag{
						Name:        	"file",
						Aliases: 		[]string{"f"},
						Usage:       	"If supplied, export/list to and import from <file> instead of stdout and stdin. For -S, use as file prefix",
						Destination: 	&filename,
					},
				},
				Action:  func(c *cli.Context) error {
					frt := frodolibs.NewFRToken(tenant, realm)
					err := frt.Authenticate(username, password)
					if err == nil {
						if frt.GetDeploymentType() == "Cloud" || frt.GetDeploymentType() == "ForgeOps" {
							err = frt.GetAccessToken()
							if err != nil {
								fmt.Println(err)
							}
						}
						journeyData, _ := frodolibs.GetJourneyData(frt, journey)
						journeyJSON, err := json.Marshal(journeyData)
						if err != nil {
							fmt.Println("JSON parse error: ", err.Error())
							return nil
						}
						// fmt.Println(string(journeyJSON))

						if(filename == "") {
							var prettyJSON bytes.Buffer
							err1 := json.Indent(&prettyJSON, journeyJSON, "", "  ")
							if err1 != nil {
								fmt.Println("JSON indent error: ", err1.Error())
								return nil
							}
							fmt.Printf("%s:\n%s\n", journey, string(prettyJSON.Bytes()))
						} else {
							err = ioutil.WriteFile(filename, journeyJSON, 0644)
							if err != nil {
								if strings.Contains(err.Error(), "permission denied") {
									fmt.Printf("Error: \"%s\" already exists, please use another file name\n", filename)
								} else {
									fmt.Printf("Error: %s\n", err.Error())
								}
							}
							fmt.Println("done")
						}
					} else {
						fmt.Println(err)
					}
					return nil
				},
			},
			{
				Name:    "exportAll",
				Aliases: []string{"E"},
				Usage:   "Export all authentication trees in a realm",
				Flags: []cli.Flag {
					&cli.StringFlag{
						Name:        	"tenant",
						Aliases: 		[]string{"h"},
						Usage:       	"Access Management host URL, e.g.: https://login.example.com/openam",
						Destination:	&tenant,
						Required:		true,
					},
					&cli.StringFlag{
						Name:			"user",
						Aliases: 		[]string{"u"},
						Usage:      	"Username to login with. Must be an admin user with appropriate rights to manages authentication trees.",
						Destination:	&username,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"password",
						Aliases: 		[]string{"p"},
						Usage:       	"Password",
						Destination: 	&password,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"realm",
						Aliases: 		[]string{"r"},
						Usage:       	"Realm. If not specified, the root realm '/' is assumed. Specify realm as '/parent/child'. If using 'amadmin' as the user, login will happen against the root realm but subsequent operations will be performed in the realm specified. For all other users, login and subsequent operations will occur against the realm specified.",
						Destination: 	&realm,
					},
					&cli.StringFlag{
						Name:        	"file",
						Aliases: 		[]string{"f"},
						Usage:       	"If supplied, export/list to and import from <file> instead of stdout and stdin. For -S, use as file prefix",
						Destination: 	&filename,
					},
				},
				Action:  func(c *cli.Context) error {
					return nil
				},
			},
			{
				Name:    "exportAllSeparate",
				Aliases: []string{"S"},
				Usage:   "Export all the trees in a realm as separate files of the format FileprefixTreename.json.",
				Flags: []cli.Flag {
					&cli.StringFlag{
						Name:        	"tenant",
						Aliases: 		[]string{"h"},
						Usage:       	"Access Management host URL, e.g.: https://login.example.com/openam",
						Destination:	&tenant,
						Required:		true,
					},
					&cli.StringFlag{
						Name:			"user",
						Aliases: 		[]string{"u"},
						Usage:      	"Username to login with. Must be an admin user with appropriate rights to manages authentication trees.",
						Destination:	&username,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"password",
						Aliases: 		[]string{"p"},
						Usage:       	"Password",
						Destination: 	&password,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"realm",
						Aliases: 		[]string{"r"},
						Usage:       	"Realm. If not specified, the root realm '/' is assumed. Specify realm as '/parent/child'. If using 'amadmin' as the user, login will happen against the root realm but subsequent operations will be performed in the realm specified. For all other users, login and subsequent operations will occur against the realm specified.",
						Destination: 	&realm,
					},
				},
				Action:  func(c *cli.Context) error {
					return nil
				},
			},
			{
				Name:    "importAll",
				Aliases: []string{"s"},
				Usage:   "Import all the trees in the current directory",
				Flags: []cli.Flag {
					&cli.StringFlag{
						Name:        	"tenant",
						Aliases: 		[]string{"h"},
						Usage:       	"Access Management host URL, e.g.: https://login.example.com/openam",
						Destination:	&tenant,
						Required:		true,
					},
					&cli.StringFlag{
						Name:			"user",
						Aliases: 		[]string{"u"},
						Usage:      	"Username to login with. Must be an admin user with appropriate rights to manages authentication trees.",
						Destination:	&username,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"password",
						Aliases: 		[]string{"p"},
						Usage:       	"Password",
						Destination: 	&password,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"realm",
						Aliases: 		[]string{"r"},
						Usage:       	"Realm. If not specified, the root realm '/' is assumed. Specify realm as '/parent/child'. If using 'amadmin' as the user, login will happen against the root realm but subsequent operations will be performed in the realm specified. For all other users, login and subsequent operations will occur against the realm specified.",
						Destination: 	&realm,
					},
				},
				Action:  func(c *cli.Context) error {
					return nil
				},
			},
			{
				Name:    "import",
				Aliases: []string{"i"},
				Usage:   "Import an authentication tree.",
				Flags: []cli.Flag {
					&cli.StringFlag{
						Name:        	"tenant",
						Aliases: 		[]string{"h"},
						Usage:       	"Access Management host URL, e.g.: https://login.example.com/openam",
						Destination:	&tenant,
						Required:		true,
					},
					&cli.StringFlag{
						Name:			"user",
						Aliases: 		[]string{"u"},
						Usage:      	"Username to login with. Must be an admin user with appropriate rights to manages authentication trees.",
						Destination:	&username,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"password",
						Aliases: 		[]string{"p"},
						Usage:       	"Password",
						Destination: 	&password,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"tree",
						Aliases: 		[]string{"t"},
						Usage:       	"Specify the name of an authentication tree. Mandatory in combination with the following actions: -i, -e, -d.",
						Destination: 	&journey,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"realm",
						Aliases: 		[]string{"r"},
						Usage:       	"Realm. If not specified, the root realm '/' is assumed. Specify realm as '/parent/child'. If using 'amadmin' as the user, login will happen against the root realm but subsequent operations will be performed in the realm specified. For all other users, login and subsequent operations will occur against the realm specified.",
						Destination: 	&realm,
					},
					&cli.StringFlag{
						Name:        	"file",
						Aliases: 		[]string{"f"},
						Usage:       	"If supplied, export/list to and import from <file> instead of stdout and stdin. For -S, use as file prefix",
						Destination: 	&filename,
					},
				},
				Action:  func(c *cli.Context) error {
					return nil
				},
			},
			{
				Name:    "importAllInRealm",
				Aliases: []string{"I"},
				Usage:   "Import all the trees in a realm",
				Flags: []cli.Flag {
					&cli.StringFlag{
						Name:        	"tenant",
						Aliases: 		[]string{"h"},
						Usage:       	"Access Management host URL, e.g.: https://login.example.com/openam",
						Destination:	&tenant,
						Required:		true,
					},
					&cli.StringFlag{
						Name:			"user",
						Aliases: 		[]string{"u"},
						Usage:      	"Username to login with. Must be an admin user with appropriate rights to manages authentication trees.",
						Destination:	&username,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"password",
						Aliases: 		[]string{"p"},
						Usage:       	"Password",
						Destination: 	&password,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"realm",
						Aliases: 		[]string{"r"},
						Usage:       	"Realm. If not specified, the root realm '/' is assumed. Specify realm as '/parent/child'. If using 'amadmin' as the user, login will happen against the root realm but subsequent operations will be performed in the realm specified. For all other users, login and subsequent operations will occur against the realm specified.",
						Destination: 	&realm,
					},
				},
				Action:  func(c *cli.Context) error {
					return nil
				},
			},
			{
				Name:    "list",
				Aliases: []string{"l"},
				Usage:   "If -h is supplied, describe the indicated tree in the realm, otherwise describe the tree export file indicated by -f",
				Flags: []cli.Flag {
					&cli.StringFlag{
						Name:        	"tenant",
						Aliases: 		[]string{"h"},
						Usage:       	"Access Management host URL, e.g.: https://login.example.com/openam",
						Destination:	&tenant,
					},
					&cli.StringFlag{
						Name:			"user",
						Aliases: 		[]string{"u"},
						Usage:      	"Username to login with. Must be an admin user with appropriate rights to manages authentication trees.",
						Destination:	&username,
					},
					&cli.StringFlag{
						Name:        	"password",
						Aliases: 		[]string{"p"},
						Usage:       	"Password",
						Destination: 	&password,
					},
					&cli.StringFlag{
						Name:        	"realm",
						Aliases: 		[]string{"r"},
						Usage:       	"Realm. If not specified, the root realm '/' is assumed. Specify realm as '/parent/child'. If using 'amadmin' as the user, login will happen against the root realm but subsequent operations will be performed in the realm specified. For all other users, login and subsequent operations will occur against the realm specified.",
						Destination: 	&realm,
						Required:		true,
					},
				},
				Action:  func(c *cli.Context) error {
					frt := frodolibs.NewFRToken(tenant, realm)
					err := frt.Authenticate(username, password)
					if err != nil {
						fmt.Println(err)
					}

					journeys, _ := frodolibs.ListJourneys(frt)
					customPresent := false
					fmt.Printf("List of journeys:\n")
					for item := range journeys {
						if journeys[item] == true {
							customPresent = true
							fmt.Printf("- %s (*)\n", item)
						} else {
							fmt.Printf("- %s\n", item)
						}
					}
					if customPresent {
						fmt.Printf("\n(*) Tree contains custom node(s).\n")
					}

					return nil
				},
			},
			{
				Name:    "describe",
				Aliases: []string{"d"},
				Usage:   "Describe all the trees in a realm",
				Flags: []cli.Flag {
					&cli.StringFlag{
						Name:        	"tenant",
						Aliases: 		[]string{"h"},
						Usage:       	"Access Management host URL, e.g.: https://login.example.com/openam",
						Destination:	&tenant,
						Required:		true,
					},
					&cli.StringFlag{
						Name:			"user",
						Aliases: 		[]string{"u"},
						Usage:      	"Username to login with. Must be an admin user with appropriate rights to manages authentication trees.",
						Destination:	&username,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"password",
						Aliases: 		[]string{"p"},
						Usage:       	"Password",
						Destination: 	&password,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"tree",
						Aliases: 		[]string{"t"},
						Usage:       	"Specify the name of an authentication tree. Mandatory in combination with the following actions: -i, -e, -d.",
						Destination: 	&journey,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"realm",
						Aliases: 		[]string{"r"},
						Usage:       	"Realm. If not specified, the root realm '/' is assumed. Specify realm as '/parent/child'. If using 'amadmin' as the user, login will happen against the root realm but subsequent operations will be performed in the realm specified. For all other users, login and subsequent operations will occur against the realm specified.",
						Destination: 	&realm,
					},
					&cli.StringFlag{
						Name:        	"file",
						Aliases: 		[]string{"f"},
						Usage:       	"If supplied, export/list to and import from <file> instead of stdout and stdin. For -S, use as file prefix",
						Destination: 	&filename,
					},
					&cli.StringFlag{
						Name:        	"version",
						Aliases: 		[]string{"v"},
						Usage:       	"Override version. Notation: \"X.Y.Z\" e.g. \"6.5.2\".\nOverride detected version with any version. This is helpful in\norder to check if trees in one environment would be compatible \nrunning in another environment (e.g. in preparation of migrating\nfrom on-prem to ForgeRock Identity Cloud PaaS. Only impacts these\nactions: -d, -l.",
						Destination: 	&version,
					},
				},
				Action:  func(c *cli.Context) error {
					frt := frodolibs.NewFRToken(tenant, realm)
					err := frt.Authenticate(username, password)
					if err == nil {
						// fmt.Println(tokenId)
						if frt.GetDeploymentType() == "Cloud" || frt.GetDeploymentType() == "ForgeOps" {
							err = frt.GetAccessToken()
							if err != nil {
								fmt.Println(err)
							}
						}
						journeyData, err1 := frodolibs.GetJourneyData(frt, journey)
						if err1 == nil {
							treeDescription := frodolibs.DescribeTree(journeyData)
							fmt.Printf("\n==========\n")
							fmt.Printf("\nTree name: %s\n\nNodes:\n", treeDescription["treeName"])
							for nodeType := range treeDescription["nodeTypes"].(map[string]int) {
								fmt.Printf("\t- %s: %d\n", nodeType, treeDescription["nodeTypes"].(map[string]int)[nodeType])
							}
							fmt.Printf("\nScripts (name: description):\n")
							for script := range treeDescription["scripts"].(map[string]string) {
								fmt.Printf("\t- %s: %s\n", script, treeDescription["scripts"].(map[string]string)[script])
							}
							fmt.Printf("\n==========\n")	
						} else {
							fmt.Printf("Error: %s", err1.Error())
						}
					} else {
						fmt.Println(err)
					}
					return nil
				},
			},
			{
				Name:    "describeAll",
				Aliases: []string{"D"},
				Usage:   "If -h is supplied, describe all the trees in the realm, otherwise describe all tree export files in the current directory",
				Flags: []cli.Flag {
					&cli.StringFlag{
						Name:        	"tenant",
						Aliases: 		[]string{"h"},
						Usage:       	"Access Management host URL, e.g.: https://login.example.com/openam",
						Destination:	&tenant,
						Required:		true,
					},
					&cli.StringFlag{
						Name:			"user",
						Aliases: 		[]string{"u"},
						Usage:      	"Username to login with. Must be an admin user with appropriate rights to manages authentication trees.",
						Destination:	&username,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"password",
						Aliases: 		[]string{"p"},
						Usage:       	"Password",
						Destination: 	&password,
						Required:		true,
					},
				},
				Action:  func(c *cli.Context) error {
					return nil
				},
			},
			{
				Name:    "prune",
				Aliases: []string{"p"},
				Usage:   "Prune orphaned configuration artifacts left behind after deleting authentication trees. You will be prompted before any destructive operations are performed.",
				Flags: []cli.Flag {
					&cli.StringFlag{
						Name:        	"tenant",
						Aliases: 		[]string{"h"},
						Usage:       	"Access Management host URL, e.g.: https://login.example.com/openam",
						Destination:	&tenant,
						Required:		true,
					},
					&cli.StringFlag{
						Name:			"user",
						Aliases: 		[]string{"u"},
						Usage:      	"Username to login with. Must be an admin user with appropriate rights to manages authentication trees.",
						Destination:	&username,
						Required:		true,
					},
					&cli.StringFlag{
						Name:        	"password",
						Aliases: 		[]string{"p"},
						Usage:       	"Password",
						Destination: 	&password,
						Required:		true,
					},
				},
				Action:  func(c *cli.Context) error {
					return nil
				},
			},
		},
		Action: func(c *cli.Context) error {
			if c.NArg() == 0 {
				cli.ShowAppHelp(c)
			}
			return nil
		},
	}

	err := app.Run(os.Args)
	if err != nil {
	  log.Fatal(err)
	}
	// configList, _ := frodolibs.ExportConfigEntity(tenant, bearerToken, "")
}