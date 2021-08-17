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
    var host string
    var username string
    var password string
    var realm string
    var filename string
    var journey string
    var version string
    var deployment string

    cli.HelpFlag = &cli.BoolFlag{
        Name:    "help",
        Aliases: []string{"q"},
        Usage:   "Help",
    }

    hostFlag := &cli.StringFlag{
        Name:        "host",
        Aliases:     []string{"h"},
        Usage:       "Access Management base URL, e.g.: https://cdk.iam.example.com/am",
        Destination: &host,
        Required:    true,
    }

    usernameFlag := &cli.StringFlag{
        Name:        "user",
        Aliases:     []string{"u"},
        Usage:       "Username to login with. Must be an admin user with appropriate rights to manage authentication journeys/trees. For Identity Cloud use a tenant admin account if possible.",
        Destination: &username,
        Required:    true,
    }

    passwordFlag := &cli.StringFlag{
        Name:        "password",
        Aliases:     []string{"p"},
        Usage:       "Password.",
        Destination: &password,
        Required:    true,
    }

    treeFlag := &cli.StringFlag{
        Name:        "tree",
        Aliases:     []string{"t"},
        Usage:       "Specify the name of an authentication journey/tree. Mandatory in combination with the following commands: import, export, describe.",
        Destination: &journey,
        Required:    true,
    }

    realmFlag := &cli.StringFlag{
        Name:        "realm",
        Aliases:     []string{"r"},
        Usage:       "Realm. If not specified, the root realm '/' is assumed. Specify realm as '/parent/child'. Note the leading '/'!",
        Destination: &realm,
    }

    fileFlag := &cli.StringFlag{
        Name:        "file",
        Aliases:     []string{"f"},
        Usage:       "If supplied, export/list to and import from <file> instead of stdout and stdin. For command exportAllSeparate, use as file prefix.",
        Destination: &filename,
    }

    versionFlag := &cli.StringFlag{
        Name:        "version",
        Aliases:     []string{"v"},
        Usage:       "Override version. Notation: \"X.Y.Z\" e.g. \"7.1.0\".\nOverride detected version with any version. This is helpful in\norder to check if trees in one environment would be compatible \nrunning in another environment (e.g. in preparation of migrating\nfrom on-prem to ForgeRock Identity Cloud. Only impacts these\ncommands: describe, list.",
        Destination: &version,
    }

    deploymentFlag := &cli.StringFlag{
        Name:        "deployment",
        Aliases:     []string{"m"},
        Usage:       "Override auto-detected deployment type. Valid values for type:\nClassic  - A classic Access Management-only deployment with custom layout and configuration.\nCloud    - A ForgeRock Identity Cloud environment.\nForgeOps - A ForgeOps CDK or CDM deployment.\nThe detected or provided deployment type controls certain behavior\nlike obtaining an Identity Management admin token or not and whether\nto export/import referenced email templates or how to walk through\nthe tenant admin login flow of Identity Cloud and skip MFA.",
        Destination: &deployment,
    }

    noreuuidFlag := &cli.BoolFlag{
        Name:    "noreuuid",
        Aliases: []string{"n"},
        Usage:   "No Re-UUID, i.e., import does not generate new UUIDs for (inner)nodes. Used to update existing journeys/trees/nodes instead of cloning them.",
    }

    app := &cli.App{
        Name:  "frodo",
        Usage: "ForgeROck DO - a CLI utility for managing (export/import etc.) ForgeRock Identity Platform configuration. The utility supports Identity Cloud, ForgeOps (CDM/CDK) deployments, and classic deployments.",
        Commands: []*cli.Command{
            {
                Name:    "info",
                Aliases: []string{"z"},
                Usage:   "Login, print versions and tokens, then exit.",
                Flags:   []cli.Flag{hostFlag, usernameFlag, passwordFlag, deploymentFlag},
                Action: func(c *cli.Context) error {
                    frt := frodolibs.NewFRToken(host, "/")
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
                Usage:   "Export a journey/tree",
                Flags:   []cli.Flag{hostFlag, usernameFlag, passwordFlag, treeFlag, realmFlag, fileFlag, deploymentFlag},
                Action: func(c *cli.Context) error {
                    frt := frodolibs.NewFRToken(host, realm)
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

                        if filename == "" {
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
                Usage:   "Export all the journeys/trees in a realm",
                Flags:   []cli.Flag{hostFlag, usernameFlag, passwordFlag, realmFlag, fileFlag, deploymentFlag},
                Action: func(c *cli.Context) error {
                    frt := frodolibs.NewFRToken(tenant, realm)
                    err := frt.Authenticate(username, password)
                    if err == nil {
                        if frt.GetDeploymentType() == "Cloud" || frt.GetDeploymentType() == "ForgeOps" {
                            err = frt.GetAccessToken()
                            if err != nil {
                                fmt.Println(err)
                            }
                        }
                        journeys, _ := frodolibs.ListJourneys(frt)
                        var toplevelMap = make(map[string](interface{}))
                        var journeysMap = make(map[string](interface{}))
//                         toplevelMap["trees"] = make(map[string](interface{}))
                        for item := range journeys {
                            fmt.Printf("%s...\n", item)
                            journeyData, _ := frodolibs.GetJourneyData(frt, item)
                            journeysMap[item] = journeyData
                            // fmt.Println(string(journeyJSON))
                        }
                        toplevelMap["trees"] = journeysMap
                        journeyJSON, err := json.MarshalIndent(toplevelMap, "", "    ")
                        if err != nil {
                            fmt.Println("JSON parse error: ", err.Error())
                            return nil
                        }
                        fmt.Println(string(journeyJSON))
//                         fmt.Println("done")
                    } else {
                        fmt.Println(err)
                    }
                    return nil
                },
            },
            {
                Name:    "exportAllSeparate",
                Aliases: []string{"S"},
                Usage:   "Export all the journeys/trees in a realm as separate files of the format FileprefixTreename.json.",
                Flags:   []cli.Flag{hostFlag, usernameFlag, passwordFlag, realmFlag, deploymentFlag},
                Action: func(c *cli.Context) error {
                    frt := frodolibs.NewFRToken(tenant, realm)
                    err := frt.Authenticate(username, password)
                    if err == nil {
                        if frt.GetDeploymentType() == "Cloud" || frt.GetDeploymentType() == "ForgeOps" {
                            err = frt.GetAccessToken()
                            if err != nil {
                                fmt.Println(err)
                            }
                        }
                        journeys, _ := frodolibs.ListJourneys(frt)
                        
                        // first check if all intended filename do not exist already
                        for item := range journeys {
                            journeyFilename := fmt.Sprintf("%s.json", item)
                            if _, err := os.Stat(journeyFilename); err == nil {
                                fmt.Printf("Error: \"%s\" already exists, please backup/rename existing file and try again...\n", journeyFilename)
                                return nil
                            }
                        }
                        
                        for item := range journeys {
                            fmt.Printf("Exporting %s...\n", item)
                            journeyFilename := fmt.Sprintf("%s.json", item)
                            journeyData, _ := frodolibs.GetJourneyData(frt, item)
                            journeyJSON, err := json.MarshalIndent(journeyData, "", "    ")
                            if err != nil {
                                fmt.Println("JSON parse error: ", err.Error())
                                return nil
                            }
                            // fmt.Println(string(journeyJSON))
                            err = ioutil.WriteFile(journeyFilename, journeyJSON, 0644)
                            if err != nil {
                                fmt.Printf("Error writing to %s: %s\n", journeyFilename, err.Error())
                            }
                        }
                        fmt.Println("done")
                    } else {
                        fmt.Println(err)
                    }
                    return nil
                },
            },
            {
                Name:    "importAllSeparate",
                Aliases: []string{"s"},
                Usage:   "Import all the journeys/trees in the current directory (*.json).",
                Flags:   []cli.Flag{hostFlag, usernameFlag, passwordFlag, realmFlag, deploymentFlag, noreuuidFlag},
                Action: func(c *cli.Context) error {
                    return nil
                },
            },
            {
                Name:    "import",
                Aliases: []string{"i"},
                Usage:   "Import a journey/tree.",
                Flags:   []cli.Flag{hostFlag, usernameFlag, passwordFlag, treeFlag, realmFlag, fileFlag, deploymentFlag, noreuuidFlag},
                Action: func(c *cli.Context) error {
                    return nil
                },
            },
            {
                Name:    "importAll",
                Aliases: []string{"I"},
                Usage:   "Import all the journeys/trees in a realm",
                Flags:   []cli.Flag{hostFlag, usernameFlag, passwordFlag, realmFlag, deploymentFlag, noreuuidFlag},
                Action: func(c *cli.Context) error {
                    return nil
                },
            },
            {
                Name:    "list",
                Aliases: []string{"l"},
                Usage:   "List all the journeys/trees in a realm.",
                Flags:   []cli.Flag{hostFlag, usernameFlag, passwordFlag, realmFlag},
                Action: func(c *cli.Context) error {
                    frt := frodolibs.NewFRToken(host, realm)
                    err := frt.Authenticate(username, password)
                    if err != nil {
                        fmt.Println(err)
                    }

                    journeys, _ := frodolibs.ListJourneys(frt)
                    customPresent := false
                    fmt.Printf("List of journeys:\n")
                    for item := range journeys {
                        if journeys[item] {
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
                Usage:   "If -h is supplied, describe the indicated journey/tree in the realm, otherwise describe the journey/tree export file indicated by -f.",
                Flags:   []cli.Flag{hostFlag, usernameFlag, passwordFlag, treeFlag, realmFlag, fileFlag, versionFlag, deploymentFlag},
                Action: func(c *cli.Context) error {
                    frt := frodolibs.NewFRToken(host, realm)
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
                            // TODO: Need to list email templates
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
                Usage:   "If -h is supplied, describe all the journeys/trees in the realm, otherwise describe *.json files in the current directory.",
                Flags:   []cli.Flag{hostFlag, usernameFlag, passwordFlag, deploymentFlag},
                Action: func(c *cli.Context) error {
                    frt := frodolibs.NewFRToken(tenant, realm)
                    err := frt.Authenticate(username, password)
                    if err != nil {
                        fmt.Println(err)
                    }

                    journeys, _ := frodolibs.ListJourneys(frt)
// 					fmt.Printf("List of journeys:\n")
                    for item := range journeys {
                        journeyData, err1 := frodolibs.GetJourneyData(frt, item)
                        if err1 == nil {
                            fmt.Printf("\n==========\n")
                            fmt.Printf("\nTree name: %s\n\nNodes:\n", item)
                            treeDescription := frodolibs.DescribeTree(journeyData)
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
                    }
                    return nil
                },
            },
            {
                Name:    "prune",
                Aliases: []string{"p"},
                Usage:   "Prune orphaned configuration artifacts left behind after deleting authentication trees. You will be prompted before any irreversible operations are performed.",
                Flags:   []cli.Flag{hostFlag, usernameFlag, passwordFlag},
                Action: func(c *cli.Context) error {
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
